-- Local disposable cluster provisioning, run once as the cluster administrator.
-- Passwords are assigned separately by the harness and never logged.
CREATE ROLE rdv_migration LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE rdv_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE DATABASE rdv_test OWNER rdv_migration;
REVOKE ALL ON DATABASE rdv_test FROM PUBLIC;
GRANT CONNECT ON DATABASE rdv_test TO rdv_migration, rdv_app;
