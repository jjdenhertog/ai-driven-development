import { useCallback, useState, useMemo } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type BTextFieldProps = TextFieldProps & {
  readonly onPressEnter?: () => void;
  readonly validation?: 'name' | 'email' | 'phonenumber';
  readonly maxLength?: number;
  readonly showCharCount?: boolean;
};

export const BTextField = (props: BTextFieldProps) => {
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState(props.helperText || '');
  
  // Clean custom props before spreading
  const textFieldProps = { ...props };
  delete textFieldProps.onPressEnter;
  delete textFieldProps.validation;
  delete textFieldProps.maxLength;
  delete textFieldProps.showCharCount;
  
  // Validation patterns
  const validationPatterns = useMemo(() => ({
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    phonenumber: /^[\d\s\-\+\(\)]+$/,
    name: /^[a-zA-Z\s\-']+$/,
  }), []);
  
  // Validate input based on type
  const validateInput = useCallback((value: string) => {
    if (!props.validation || !value) {
      setError(false);
      setHelperText(props.helperText || '');
      return true;
    }
    
    const pattern = validationPatterns[props.validation];
    const isValid = pattern.test(value);
    
    if (!isValid) {
      setError(true);
      switch (props.validation) {
        case 'email':
          setHelperText('Please enter a valid email address');
          break;
        case 'phonenumber':
          setHelperText('Please enter a valid phone number');
          break;
        case 'name':
          setHelperText('Please enter a valid name (letters only)');
          break;
      }
    } else {
      setError(false);
      setHelperText(props.helperText || '');
    }
    
    return isValid;
  }, [props.validation, props.helperText, validationPatterns]);
  
  // Handle key press events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && props.onPressEnter)
      props.onPressEnter();
    
    // Call original handler if exists
    props.onKeyDown?.(e);
  }, [props.onPressEnter, props.onKeyDown]);
  
  // Handle change with validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Enforce max length if specified
    if (props.maxLength && value.length > props.maxLength)
      return;
    
    // Validate input
    validateInput(value);
    
    // Call original handler
    props.onChange?.(e);
  }, [props.onChange, props.maxLength, validateInput]);
  
  // Handle blur to trigger validation
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    validateInput(e.target.value);
    props.onBlur?.(e);
  }, [props.onBlur, validateInput]);
  
  // Character count display
  const characterCount = useMemo(() => {
    if (!props.showCharCount || !props.maxLength) return '';
    
    const currentLength = String(props.value || '').length;
    return `${currentLength}/${props.maxLength}`;
  }, [props.value, props.maxLength, props.showCharCount]);
  
  // Computed helper text
  const computedHelperText = useMemo(() => {
    if (error) return helperText;
    if (characterCount) return `${helperText ? helperText + ' • ' : ''}${characterCount}`;
    return helperText;
  }, [error, helperText, characterCount]);
  
  return (
    <TextField
      {...textFieldProps}
      error={error || props.error}
      helperText={computedHelperText}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      variant={props.variant || 'outlined'}
      size={props.size || 'small'}
      fullWidth={props.fullWidth !== false}
    />
  );
};

// Example usage patterns
export const BTextFieldExamples = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = useCallback(() => {
    console.log('Form submitted');
  }, []);
  
  return (
    <>
      {/* Email validation */}
      <BTextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        validation="email"
        required
        onPressEnter={handleSubmit}
      />
      
      {/* Name with character limit */}
      <BTextField
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        validation="name"
        maxLength={50}
        showCharCount
        helperText="Enter your full name"
      />
      
      {/* Phone number */}
      <BTextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        validation="phonenumber"
        placeholder="+1 (555) 123-4567"
      />
    </>
  );
};