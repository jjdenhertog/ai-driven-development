'use client';

import { useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { BTextField } from './BTextField';
import styles from './UserRegistrationForm.module.scss';

// Comprehensive schema with all validation rules
const registrationSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in name'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in name'),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
    .min(10, 'Phone number too short'),
  
  // Account Information
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[!@#$%^&*]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
  
  // Profile Details
  role: z.enum(['user', 'admin', 'moderator']),
  department: z.string().min(1, 'Department is required'),
  bio: z.string().max(500, 'Bio too long').optional(),
  
  // Preferences
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(), 
    push: z.boolean(),
  }),
  
  // Address information (following your API patterns)
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().min(1, 'Country is required'),
  }),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  subscribeNewsletter: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const departments = [
  'Engineering',
  'Marketing',
  'Sales',
  'Support',
  'HR',
  'Finance',
  'Operations',
];

const steps = ['Personal Info', 'Account Setup', 'Preferences'];

export const UserRegistrationForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      department: '',
      bio: '',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      enqueueSnackbar('Registration successful! Please check your email.', { 
        variant: 'success' 
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const handleNext = useCallback(async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, trigger]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const onSubmit = handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  const watchPassword = watch('password');

  return (
    <Card className={styles.RegistrationForm}>
      <CardContent>
        <Typography variant="h4" className={styles.title}>
          Create Your Account
        </Typography>
        
        <Stepper activeStep={activeStep} className={styles.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={onSubmit} className={styles.form}>
          {activeStep === 0 && (
            <Box className={styles.stepContent}>
              <Typography variant="h6" className={styles.stepTitle}>
                Personal Information
              </Typography>
              
              <Box className={styles.row}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <BTextField
                      {...field}
                      label="First Name"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      validation="name"
                      required
                    />
                  )}
                />
                
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <BTextField
                      {...field}
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      validation="name"
                      required
                    />
                  )}
                />
              </Box>
              
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    label="Email Address"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    validation="email"
                    required
                  />
                )}
              />
              
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    label="Phone Number"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    validation="phonenumber"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                )}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box className={styles.stepContent}>
              <Typography variant="h6" className={styles.stepTitle}>
                Account Setup
              </Typography>
              
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    label="Username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    required
                  />
                )}
              />
              
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    type="password"
                    label="Password"
                    error={!!errors.password}
                    helperText={errors.password?.message || 'Must contain uppercase, lowercase, number, and special character'}
                    required
                  />
                )}
              />
              
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    type="password"
                    label="Confirm Password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    required
                  />
                )}
              />
              
              <Box className={styles.row}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <BTextField
                      {...field}
                      select
                      label="Role"
                      error={!!errors.role}
                      helperText={errors.role?.message}
                      required
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                    </BTextField>
                  )}
                />
                
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <BTextField
                      {...field}
                      select
                      label="Department"
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      required
                    >
                      {departments.map(dept => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </BTextField>
                  )}
                />
              </Box>
              
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <BTextField
                    {...field}
                    label="Bio"
                    multiline
                    rows={4}
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                    maxLength={500}
                    showCharCount
                  />
                )}
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box className={styles.stepContent}>
              <Typography variant="h6" className={styles.stepTitle}>
                Preferences & Terms
              </Typography>
              
              <Box className={styles.notificationSection}>
                <Typography variant="subtitle1">
                  Notification Preferences
                </Typography>
                
                <Controller
                  name="notifications.email"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Email notifications"
                    />
                  )}
                />
                
                <Controller
                  name="notifications.sms"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="SMS notifications"
                    />
                  )}
                />
                
                <Controller
                  name="notifications.push"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Push notifications"
                    />
                  )}
                />
              </Box>
              
              <Controller
                name="subscribeNewsletter"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Subscribe to newsletter"
                  />
                )}
              />
              
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <Box>
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="I agree to the terms and conditions"
                      required
                    />
                    {errors.agreeToTerms && (
                      <FormHelperText error>
                        {errors.agreeToTerms.message}
                      </FormHelperText>
                    )}
                  </Box>
                )}
              />
            </Box>
          )}

          <Box className={styles.actions}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box sx={{ flex: '1 1 auto' }} />
            
            {activeStep === steps.length - 1 ? (
              <LoadingButton
                type="submit"
                variant="contained"
                loading={registerMutation.isPending}
                disabled={!isValid}
              >
                Complete Registration
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

// Helper function to get fields for each step
function getFieldsForStep(step: number): (keyof RegistrationFormData)[] {
  switch (step) {
    case 0:
      return ['firstName', 'lastName', 'email', 'phone'];
    case 1:
      return ['username', 'password', 'confirmPassword', 'role', 'department'];
    case 2:
      return ['agreeToTerms'];
    default:
      return [];
  }
}