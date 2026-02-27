import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  event_date: z
    .string()
    .min(1, 'Start date & time is required'),
  event_end_date: z.string().optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  event_type: z.enum(['public', 'private']),
  tag_ids: z.array(z.number()).optional(),
})
// End date must be after start date
.refine(
  (data) => {
    if (data.event_end_date && data.event_date) {
      return new Date(data.event_end_date) > new Date(data.event_date);
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['event_end_date'] }
)
// Event date must not be in the past
.refine(
  (data) => {
    if (data.event_date) {
      const now = new Date();
      const eventDate = new Date(data.event_date);
      // Ignore time zone for simplicity, but you can adjust as needed
      return eventDate >= now;
    }
    return true;
  },
  { message: 'Event date must be in the future', path: ['event_date'] }
);

export const editEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  event_date: z
    .string()
    .min(1, 'Start date & time is required'),
  event_end_date: z.string().optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  event_type: z.enum(['public', 'private']),
  tag_ids: z.array(z.number()).optional(),
})
// End date must be after start date
.refine(
  (data) => {
    if (data.event_end_date && data.event_date) {
      return new Date(data.event_end_date) > new Date(data.event_date);
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['event_end_date'] }
);

export type EditEventFormValues = z.infer<typeof editEventSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateEventFormValues = z.infer<typeof createEventSchema>;
