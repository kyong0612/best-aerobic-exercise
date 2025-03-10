import { type HTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes, forwardRef } from "react";

// Formラッパーコンポーネント
export interface FormProps extends HTMLAttributes<HTMLFormElement> {}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={`space-y-4 ${className}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";

// FormFieldコンポーネント
export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className = "", error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`space-y-1 ${className}`}
        {...props}
      >
        {children}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Labelコンポーネント
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = "", required = false, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

// Inputコンポーネント
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-md border ${
          error
            ? "border-red-600 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        } px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// Textareaコンポーネント
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-md border ${
          error
            ? "border-red-600 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        } px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// Selectコンポーネント
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error = false, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-md border ${
          error
            ? "border-red-600 dark:border-red-400"
            : "border-gray-300 dark:border-gray-600"
        } px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
