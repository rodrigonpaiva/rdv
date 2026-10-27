'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface FieldContent {
  label: string;
  help?: string;
  error?: string;
  loading?: boolean;
}
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldContent {}
export function TextField({ label, help, error, loading, id: suppliedId, className = '', 'aria-describedby': describedBy, ...props }: TextFieldProps) {
  const generatedId = useId(); const id = suppliedId ?? generatedId;
  const description = [describedBy, help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`ds-field ${className}`} aria-busy={loading || undefined}>
    <label htmlFor={id}>{label}{props.required && <span className="ds-required" aria-hidden="true"> *</span>}</label>
    <input {...props} id={id} className="ds-control" aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description} readOnly={props.readOnly || loading} />
    {help && <p className="ds-field-help" id={`${id}-help`}>{help}</p>}
    {error && <p className="ds-field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldContent { children: ReactNode }
export function SelectField({ label, help, error, loading, children, id: suppliedId, className = '', 'aria-describedby': describedBy, ...props }: SelectFieldProps) {
  const generatedId = useId(); const id = suppliedId ?? generatedId;
  const description = [describedBy, help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`ds-field ${className}`} aria-busy={loading || undefined}>
    <label htmlFor={id}>{label}{props.required && <span className="ds-required" aria-hidden="true"> *</span>}</label>
    <select {...props} id={id} className="ds-control" disabled={props.disabled || loading} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description}>{children}</select>
    {help && <p className="ds-field-help" id={`${id}-help`}>{help}</p>}
    {error && <p className="ds-field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label: ReactNode; help?: string; error?: string }
export function CheckboxField({ label, help, error, id: suppliedId, className = '', 'aria-describedby': describedBy, ...props }: CheckboxFieldProps) {
  const generatedId = useId(); const id = suppliedId ?? generatedId;
  const description = [describedBy, help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`ds-field ${className}`}><label className="ds-checkbox-label" htmlFor={id}>
    <input {...props} type="checkbox" id={id} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description} /><span>{label}</span></label>
    {help && <p className="ds-field-help" id={`${id}-help`}>{help}</p>}{error && <p className="ds-field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}
