import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const serverPackages = new Set(['@agenda/backend', '@agenda/config', '@agenda/testkit']);
const serverImports = /^(?:@prisma(?:\/|$)|@nestjs(?:\/|$)|prisma$|pg$|bullmq$|ioredis$|redis$|node:(?:fs|child_process|net|tls|process)(?:\/|$))/;
const normalize = (value) => value.replaceAll(path.sep, '/');
function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', '.next'].includes(entry.name)) return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(full) : /\.(?:[cm]?ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}
export function workspaceTopology(root) {
  return ['apps', 'packages'].flatMap((area) => {
    const base = path.join(root, area);
    if (!fs.existsSync(base)) return [];
    return fs.readdirSync(base).flatMap((name) => {
      const directory = path.join(base, name);
      const manifestPath = path.join(directory, 'package.json');
      if (!fs.existsSync(manifestPath)) return [];
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return [{ name: manifest.name, directory, area, manifest }];
    });
  });
}
function ownerOf(filename, topology) {
  return topology.find((w) => filename.startsWith(`${w.directory}${path.sep}`));
}
function importsIn(source) {
  const imports = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      imports.push(ts.isStringLiteralLike(node.moduleSpecifier) ? node.moduleSpecifier.text : null);
    }
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      imports.push(node.moduleReference.expression && ts.isStringLiteralLike(node.moduleReference.expression) ? node.moduleReference.expression.text : null);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      const arg = node.arguments[0];
      imports.push(arg && ts.isStringLiteralLike(arg) ? arg.text : null);
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) imports.push(node.argument.literal.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return imports;
}
export function inspectSource(filename, code, root, topology) {
  const errors = [];
  const relative = normalize(path.relative(root, filename));
  const from = ownerOf(filename, topology);
  if (!from) return errors;
  const domain = relative.includes('/domain/');
  const application = relative.includes('/application/') && from.name === '@agenda/backend';
  const browser = ['@agenda/web', '@agenda/ui'].includes(from.name);
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
  let compilerOptions = { moduleResolution: ts.ModuleResolutionKind.NodeNext, module: ts.ModuleKind.NodeNext };
  const configPath = ts.findConfigFile(path.dirname(filename), ts.sys.fileExists);
  if (configPath) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (!config.error) compilerOptions = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath)).options;
  }
  function fail(message) { errors.push(`${relative}: ${message}`); }
  for (const specifier of importsIn(source)) {
    if (specifier === null) { fail('computed imports cannot be checked; use a literal public import'); continue; }
    if (browser && serverImports.test(specifier)) fail(`browser code imports server dependency ${specifier}`);
    const targetWorkspace = topology.find((w) => specifier === w.name || specifier.startsWith(`${w.name}/`));
    const resolved = ts.resolveModuleName(specifier, filename, compilerOptions, ts.sys).resolvedModule?.resolvedFileName;
    const targetPath = resolved ? path.resolve(resolved) : specifier.startsWith('.') ? path.resolve(path.dirname(filename), specifier) : null;
    const targetOwner = targetPath ? ownerOf(targetPath, topology) : null;
    if (domain && (!specifier.startsWith('.') || !targetPath || !normalize(targetPath).includes('/domain/'))) fail(`domain imports outside its domain: ${specifier}`);
    if (application && (serverImports.test(specifier) || normalize(targetPath ?? specifier).includes('/infrastructure/'))) fail(`application imports infrastructure/framework: ${specifier}`);
    if (targetWorkspace && targetWorkspace.name !== from.name) {
      const declared = { ...from.manifest.dependencies, ...from.manifest.devDependencies, ...from.manifest.peerDependencies };
      if (!(targetWorkspace.name in declared)) fail(`undeclared workspace dependency ${targetWorkspace.name}`);
      const subpath = specifier === targetWorkspace.name ? '.' : `.${specifier.slice(targetWorkspace.name.length)}`;
      if (!(subpath in (targetWorkspace.manifest.exports ?? {}))) fail(`non-public workspace import ${specifier}`);
      if (targetWorkspace.area === 'apps') fail(`an application cannot be imported by ${from.name}`);
    }
    if (targetOwner && targetOwner.name !== from.name && !targetWorkspace) fail(`cross-workspace path/alias bypasses public exports: ${specifier}`);
    if (browser && targetPath && !targetOwner && !normalize(targetPath).includes('/node_modules/')) fail(`browser import escapes the workspace: ${specifier}`);
    if (browser && ((targetWorkspace && serverPackages.has(targetWorkspace.name)) || (targetOwner && serverPackages.has(targetOwner.name)))) fail(`browser imports server-only workspace ${specifier}`);
    if (application && targetWorkspace && !['@agenda/backend', '@agenda/contracts'].includes(targetWorkspace.name)) fail(`application imports non-domain workspace ${specifier}`);
  }
  if (browser) {
    function visit(node) {
      if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && node.expression.getText(source) === 'process' && (ts.isPropertyAccessExpression(node) ? node.name.text === 'env' : node.argumentExpression?.getText(source).replaceAll(/['"]/g, '') === 'env')) fail('web/UI cannot read server environment; use an explicit public contract');
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return errors;
}
export function inspectManifests(topology) {
  const errors = [];
  const byName = new Map(topology.map((w) => [w.name, w]));
  for (const origin of topology.filter((w) => ['@agenda/web', '@agenda/ui'].includes(w.name))) {
    const seen = new Set();
    function visit(workspace) {
      if (seen.has(workspace.name)) return;
      seen.add(workspace.name);
      for (const dep of Object.keys({ ...workspace.manifest.dependencies, ...workspace.manifest.peerDependencies })) {
        if (serverPackages.has(dep) || serverImports.test(dep)) errors.push(`${origin.name}: server dependency in workspace closure via ${workspace.name}: ${dep}`);
        const next = byName.get(dep);
        if (next) visit(next);
      }
    }
    visit(origin);
  }
  return errors;
}
export function checkRepository(root) {
  const topology = workspaceTopology(root);
  const files = topology.flatMap((w) => filesIn(w.directory));
  const errors = inspectManifests(topology);
  for (const filename of files) errors.push(...inspectSource(filename, fs.readFileSync(filename, 'utf8'), root, topology));
  return { files: files.length, workspaces: topology.length, errors };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkRepository(process.cwd());
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1; }
  else console.log(`Architecture boundaries passed: ${result.workspaces} workspaces, ${result.files} source files.`);
}
