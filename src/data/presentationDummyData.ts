// Dummy data for presentation mode
import { BragSheetEntry, BragCategory } from '@/hooks/useBragSheet';
import { StudentGoal } from '@/hooks/useStudentGoals';
import { TargetSchool } from '@/hooks/useTargetSchools';
import { format, addDays, startOfWeek, isWeekend, endOfWeek } from 'date-fns';

// Helper to generate IDs
const genId = () => `demo-${Math.random().toString(36).substr(2, 9)}`;

export const dummyProfile = {
  id: genId(),
  user_id: 'demo-user',
  full_name: 'Ramakrishna Krishna',
  avatar_url: null,
  school_name: 'Generic Middle School',
  school_id: null,
  grade_level: '8th Grade',
  calendar_sync_enabled: false,
  last_grade_progression: null,
  is_graduated: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const dummyBragSheetEntries: BragSheetEntry[] = [
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Created LunchLit',
    category: 'leadership',
    description: 'Created LunchLit',
    impact: 'Allowed students to have a more efficient school life.',
    start_date: '2025-12-01',
    end_date: '2026-04-30',
    is_ongoing: false,
    grade_level: '8th Grade',
    school_year: '2025-2026',
    hours_spent: 33,
    position_role: 'Founder & Lead Developer',
    grades_participated: ['8th Grade'],
    year_received: null,
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Edited Book',
    category: 'volunteering',
    description: 'I edited the book "The Echoes of Tomorrow" and created the cover.',
    impact: null,
    start_date: '2025-11-01',
    end_date: '2026-05-31',
    is_ongoing: false,
    grade_level: '8th Grade',
    school_year: '2025-2026',
    hours_spent: 6,
    position_role: 'Book Editor & Cover Designer',
    grades_participated: ['8th Grade'],
    year_received: null,
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'EY & Microsoft Ai Skills Passport Completion',
    category: 'award',
    description: 'Completed the course "AI Skills Passport" offered by EY and Microsoft',
    impact: 'Completed the course "AI Skills Passport" offered by EY and Microsoft',
    start_date: '2026-01-15',
    end_date: '2026-01-15',
    is_ongoing: false,
    grade_level: '8th Grade',
    school_year: '2025-2026',
    hours_spent: 5,
    position_role: null,
    grades_participated: ['8th Grade'],
    year_received: '2026',
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Code your Dreams Innovator Award',
    category: 'award',
    description: 'Won for my work on LunchLIT',
    impact: 'Awarded the Code Your Dreams Builder / Innovator Award for creating LunchLit to make school life more organized and efficient.',
    start_date: '2026-02-01',
    end_date: '2026-02-01',
    is_ongoing: false,
    grade_level: '8th Grade',
    school_year: '2025-2026',
    hours_spent: null,
    position_role: null,
    grades_participated: ['8th Grade'],
    year_received: '2026',
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'National Honor Society President',
    category: 'leadership',
    description: 'Lead weekly meetings, organize community service events, and mentor new members in academic excellence.',
    impact: 'Increased membership by 40% and coordinated 500+ volunteer hours',
    start_date: '2024-09-01',
    end_date: null,
    is_ongoing: true,
    grade_level: 'Junior (11th)',
    school_year: '2024-2025',
    hours_spent: 120,
    position_role: 'President',
    grades_participated: ['Sophomore (10th)', 'Junior (11th)'],
    year_received: null,
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: ['https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Regional Science Fair - 1st Place',
    category: 'award',
    description: 'Won first place in Regional Science Fair for research on sustainable energy solutions using solar panel optimization.',
    impact: 'Advanced to State Science Fair competition',
    start_date: '2024-03-15',
    end_date: '2024-03-15',
    is_ongoing: false,
    grade_level: 'Sophomore (10th)',
    school_year: '2023-2024',
    hours_spent: 80,
    position_role: null,
    grades_participated: null,
    year_received: '2024',
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: ['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Varsity Debate Team Captain',
    category: 'extracurricular',
    description: 'Lead debate team to regional championships, organized practice sessions, and mentored novice debaters.',
    impact: 'Team advanced to state finals for first time in 5 years',
    start_date: '2023-09-01',
    end_date: null,
    is_ongoing: true,
    grade_level: 'Junior (11th)',
    school_year: '2024-2025',
    hours_spent: 200,
    position_role: 'Team Captain',
    grades_participated: ['Freshman (9th)', 'Sophomore (10th)', 'Junior (11th)'],
    year_received: null,
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Hospital Volunteer Program',
    category: 'volunteering',
    description: 'Assisted patients and staff at local hospital, provided comfort to patients, and helped with administrative tasks.',
    impact: 'Logged 200+ hours and received Outstanding Volunteer Award',
    start_date: '2022-06-01',
    end_date: null,
    is_ongoing: true,
    grade_level: 'Junior (11th)',
    school_year: '2024-2025',
    hours_spent: 240,
    position_role: 'Senior Volunteer',
    grades_participated: ['Freshman (9th)', 'Sophomore (10th)', 'Junior (11th)'],
    year_received: null,
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'AP Scholar with Distinction',
    category: 'academic',
    description: 'Earned scores of 4 or higher on five AP exams including Calculus BC, Physics, and English Language.',
    impact: null,
    start_date: '2024-05-01',
    end_date: '2024-05-15',
    is_ongoing: false,
    grade_level: 'Sophomore (10th)',
    school_year: '2023-2024',
    hours_spent: null,
    position_role: null,
    grades_participated: null,
    year_received: '2024',
    verification_status: 'verified',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Coding Club Founder',
    category: 'club',
    description: 'Founded and lead the school\'s first coding club, teaching programming to 30+ students.',
    impact: 'Club members created 5 apps for school use',
    start_date: '2023-09-01',
    end_date: null,
    is_ongoing: true,
    grade_level: 'Junior (11th)',
    school_year: '2024-2025',
    hours_spent: 100,
    position_role: 'Founder & President',
    grades_participated: ['Sophomore (10th)', 'Junior (11th)'],
    year_received: null,
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    verification_notes: null,
    suggested_from_task_id: null,
    is_auto_suggested: false,
    images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const dummyAcademics = {
  id: genId(),
  user_id: 'demo-user',
  gpa_weighted: 4.32,
  gpa_unweighted: 3.95,
  test_scores: [
    { type: 'SAT', test_name: 'SAT', score: '1520' },
    { type: 'ACT', test_name: 'ACT', score: '34' },
    { type: 'AP', subject: 'Calculus BC', test_name: 'AP Calculus BC', score: '5' },
    { type: 'AP', subject: 'Physics C', test_name: 'AP Physics C', score: '5' },
    { type: 'AP', subject: 'English Language', test_name: 'AP English Language', score: '4' },
  ],
  courses: [
    { name: 'AP Calculus BC', grade: 'A', year: '2024-2025' },
    { name: 'AP Physics C', grade: 'A', year: '2024-2025' },
    { name: 'AP English Literature', grade: 'A-', year: '2024-2025' },
    { name: 'AP US History', grade: 'A', year: '2024-2025' },
    { name: 'Spanish IV Honors', grade: 'A', year: '2024-2025' },
  ],
  colleges_applying: ['MIT', 'Stanford', 'Georgia Tech', 'UC Berkeley', 'Carnegie Mellon'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const dummyStudentGoals: StudentGoal[] = [
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Get accepted to MIT',
    description: 'Complete application with strong essays focusing on research experience and leadership',
    goal_type: 'college',
    target_date: '2025-03-15',
    status: 'in_progress',
    priority: 'high',
    notes: 'Early Action deadline is November 1st',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Complete summer research internship',
    description: 'Apply to research programs at local university in computer science',
    goal_type: 'career',
    target_date: '2025-06-01',
    status: 'in_progress',
    priority: 'high',
    notes: 'Applications due in February',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Score 1550+ on SAT',
    description: 'Improve SAT score by retaking in October',
    goal_type: 'personal',
    target_date: '2024-10-15',
    status: 'completed',
    priority: 'high',
    notes: 'Current score: 1520. Target: 1550+',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Apply to COSMOS summer program',
    description: 'California State Summer School for Mathematics and Science',
    goal_type: 'program',
    target_date: '2025-02-01',
    status: 'in_progress',
    priority: 'medium',
    notes: 'Need teacher recommendation letters',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const dummyTargetSchools: TargetSchool[] = [
  {
    id: genId(),
    user_id: 'demo-user',
    school_name: 'Massachusetts Institute of Technology',
    location: 'Cambridge, MA',
    application_deadline: '2025-01-01',
    admission_type: 'early_action',
    status: 'applying',
    notes: 'Top choice - strong STEM programs',
    is_reach: true,
    is_safety: false,
    is_match: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    school_name: 'Stanford University',
    location: 'Stanford, CA',
    application_deadline: '2025-01-02',
    admission_type: 'regular',
    status: 'applying',
    notes: 'Excellent CS and entrepreneurship programs',
    is_reach: true,
    is_safety: false,
    is_match: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    school_name: 'Georgia Institute of Technology',
    location: 'Atlanta, GA',
    application_deadline: '2025-01-05',
    admission_type: 'early_action',
    status: 'applied',
    notes: 'Great engineering school, good value',
    is_reach: false,
    is_safety: false,
    is_match: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    school_name: 'University of Michigan',
    location: 'Ann Arbor, MI',
    application_deadline: '2025-02-01',
    admission_type: 'regular',
    status: 'researching',
    notes: 'Strong engineering and research opportunities',
    is_reach: false,
    is_safety: false,
    is_match: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    school_name: 'UC San Diego',
    location: 'San Diego, CA',
    application_deadline: '2024-11-30',
    admission_type: 'regular',
    status: 'applied',
    notes: 'Great CS program and location',
    is_reach: false,
    is_safety: true,
    is_match: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const dummyTasks = [
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'Complete MIT supplemental essays',
    description: 'Write 5 short essays for MIT application',
    due_date: '2024-10-25',
    due_time: '23:59',
    is_completed: false,
    priority: 'high',
    category: 'college',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'AP Physics Problem Set #8',
    description: 'Chapter 12 problems 1-25',
    due_date: '2024-10-20',
    due_time: '08:00',
    is_completed: true,
    priority: 'medium',
    category: 'homework',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: genId(),
    user_id: 'demo-user',
    title: 'NHS Community Service Event',
    description: 'Park cleanup volunteer coordination',
    due_date: '2024-10-28',
    due_time: '09:00',
    is_completed: false,
    priority: 'medium',
    category: 'extracurricular',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Generate classes for ALL 5 weekdays
function generateFullWeekClasses() {
  const classes = [];
  const schedule = [
    { class_name: 'AP Calculus BC', teacher_name: 'Mrs. Chen', room_number: '201', start_time: '08:00', end_time: '09:00', color: '#3b82f6' },
    { class_name: 'AP Physics C', teacher_name: 'Mr. Johnson', room_number: '305', start_time: '09:15', end_time: '10:15', color: '#10b981' },
    { class_name: 'AP English Literature', teacher_name: 'Ms. Williams', room_number: '102', start_time: '10:30', end_time: '11:30', color: '#f59e0b' },
    { class_name: 'AP US History', teacher_name: 'Mr. Garcia', room_number: '210', start_time: '12:30', end_time: '13:30', color: '#8b5cf6' },
    { class_name: 'Spanish IV Honors', teacher_name: 'Sra. Martinez', room_number: '115', start_time: '13:45', end_time: '14:45', color: '#ec4899' },
  ];
  
  for (let day = 1; day <= 5; day++) {
    for (const cls of schedule) {
      classes.push({
        id: genId(),
        ...cls,
        day_of_week: day,
        user_id: 'demo-user',
        is_club: false,
        show_every_day: false,
        rotation_day: 'all',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  return classes;
}

export const dummyClassSchedule = generateFullWeekClasses();

export const dummyStudyHalls = [
  { id: genId(), name: 'Main Library', location: 'Building A', capacity: 50, current_occupancy: 32, is_available: true, periods: ['1', '2', '3', '4'], teacher: 'Mrs. Thompson', school_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: genId(), name: 'Science Study Room', location: 'Building B - Room 301', capacity: 20, current_occupancy: 18, is_available: true, periods: ['2', '3', '5'], teacher: 'Dr. Patel', school_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: genId(), name: 'Quiet Study Hall', location: 'Building C', capacity: 30, current_occupancy: 30, is_available: false, periods: ['1', '2', '3', '4', '5'], teacher: 'Mr. Brown', school_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Generate meals for each weekday of the current week AND the full month
function generateWeeklyMeals() {
  const today = new Date();
  const weekStart = isWeekend(today)
    ? addDays(endOfWeek(today, { weekStartsOn: 1 }), 1)
    : startOfWeek(today, { weekStartsOn: 1 });

  const dailyMenuRotation = [
    [
      { name: 'Chicken Teriyaki Bowl', description: 'Grilled chicken with teriyaki sauce, steamed rice, and vegetables', dietary_tags: ['meat', 'gluten-free'], calories: 520 },
      { name: 'Vegetarian Pasta', description: 'Penne pasta with marinara sauce and roasted vegetables', dietary_tags: ['vegetarian'], calories: 410 },
      { name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing', dietary_tags: ['vegetarian', 'dairy'], calories: 320 },
    ],
    [
      { name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pulled pork with coleslaw on a brioche bun', dietary_tags: ['meat'], calories: 580 },
      { name: 'Black Bean Tacos', description: 'Seasoned black beans, pico de gallo, and avocado on corn tortillas', dietary_tags: ['vegetarian', 'vegan', 'gluten-free'], calories: 390 },
      { name: 'Garden Salad', description: 'Mixed greens with cherry tomatoes, cucumbers, and balsamic vinaigrette', dietary_tags: ['vegan', 'gluten-free'], calories: 180 },
    ],
    [
      { name: 'Pepperoni Pizza', description: 'Hand-tossed pizza with marinara, mozzarella, and pepperoni', dietary_tags: ['meat', 'dairy'], calories: 620 },
      { name: 'Margherita Flatbread', description: 'Thin crust with fresh mozzarella, basil, and tomato sauce', dietary_tags: ['vegetarian', 'dairy'], calories: 450 },
      { name: 'Chicken Noodle Soup', description: 'Classic chicken noodle soup with carrots, celery, and herbs', dietary_tags: ['meat'], calories: 280 },
    ],
    [
      { name: 'Grilled Chicken Caesar Wrap', description: 'Grilled chicken, romaine, parmesan, and caesar dressing in a flour tortilla', dietary_tags: ['meat', 'dairy'], calories: 490 },
      { name: 'Veggie Stir Fry', description: 'Mixed vegetables with tofu in a ginger-soy sauce over brown rice', dietary_tags: ['vegan', 'vegetarian'], calories: 380 },
      { name: 'Fruit & Yogurt Parfait', description: 'Greek yogurt with granola, strawberries, and blueberries', dietary_tags: ['vegetarian', 'dairy'], calories: 290 },
    ],
    [
      { name: 'Fish & Chips', description: 'Battered cod with crispy fries and tartar sauce', dietary_tags: ['meat'], calories: 650 },
      { name: 'Mac & Cheese', description: 'Creamy three-cheese macaroni baked to perfection', dietary_tags: ['vegetarian', 'dairy'], calories: 550 },
      { name: 'Minestrone Soup', description: 'Hearty Italian vegetable soup with pasta and beans', dietary_tags: ['vegan', 'vegetarian'], calories: 240 },
    ],
  ];

  return dailyMenuRotation.map((items, i) => ({
    id: genId(),
    school_id: 'demo-school',
    meal_date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    meal_type: 'lunch',
    menu_items: items,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Generate meals for the full month (all weekdays)
function generateMonthlyMeals() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const menuRotation = [
    [
      { name: 'Chicken Teriyaki Bowl', description: 'Grilled chicken with teriyaki sauce, steamed rice, and vegetables', dietary_tags: ['meat', 'gluten-free'], calories: 520 },
      { name: 'Vegetarian Pasta', description: 'Penne pasta with marinara sauce and roasted vegetables', dietary_tags: ['vegetarian'], calories: 410 },
      { name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing', dietary_tags: ['vegetarian', 'dairy'], calories: 320 },
    ],
    [
      { name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pulled pork with coleslaw on a brioche bun', dietary_tags: ['meat'], calories: 580 },
      { name: 'Black Bean Tacos', description: 'Seasoned black beans, pico de gallo, and avocado on corn tortillas', dietary_tags: ['vegetarian', 'vegan', 'gluten-free'], calories: 390 },
      { name: 'Garden Salad', description: 'Mixed greens with cherry tomatoes, cucumbers, and balsamic vinaigrette', dietary_tags: ['vegan', 'gluten-free'], calories: 180 },
    ],
    [
      { name: 'Pepperoni Pizza', description: 'Hand-tossed pizza with marinara, mozzarella, and pepperoni', dietary_tags: ['meat', 'dairy'], calories: 620 },
      { name: 'Margherita Flatbread', description: 'Thin crust with fresh mozzarella, basil, and tomato sauce', dietary_tags: ['vegetarian', 'dairy'], calories: 450 },
      { name: 'Chicken Noodle Soup', description: 'Classic chicken noodle soup with carrots, celery, and herbs', dietary_tags: ['meat'], calories: 280 },
    ],
    [
      { name: 'Grilled Chicken Caesar Wrap', description: 'Grilled chicken, romaine, parmesan, and caesar dressing in a flour tortilla', dietary_tags: ['meat', 'dairy'], calories: 490 },
      { name: 'Veggie Stir Fry', description: 'Mixed vegetables with tofu in a ginger-soy sauce over brown rice', dietary_tags: ['vegan', 'vegetarian'], calories: 380 },
      { name: 'Fruit & Yogurt Parfait', description: 'Greek yogurt with granola, strawberries, and blueberries', dietary_tags: ['vegetarian', 'dairy'], calories: 290 },
    ],
    [
      { name: 'Fish & Chips', description: 'Battered cod with crispy fries and tartar sauce', dietary_tags: ['meat'], calories: 650 },
      { name: 'Mac & Cheese', description: 'Creamy three-cheese macaroni baked to perfection', dietary_tags: ['vegetarian', 'dairy'], calories: 550 },
      { name: 'Minestrone Soup', description: 'Hearty Italian vegetable soup with pasta and beans', dietary_tags: ['vegan', 'vegetarian'], calories: 240 },
    ],
  ];

  const meals: Record<string, unknown>[] = [];
  let current = new Date(monthStart);
  
  while (current <= monthEnd) {
    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // weekday (Mon=1 -> index 0, Fri=5 -> index 4)
      const menuIndex = (dayOfWeek - 1) % menuRotation.length;
      meals.push({
        id: genId(),
        school_id: 'demo-school',
        meal_date: format(current, 'yyyy-MM-dd'),
        meal_type: 'lunch',
        menu_items: menuRotation[menuIndex],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    current = addDays(current, 1);
  }
  
  return meals;
}

export const dummyMealSchedules = generateWeeklyMeals();
export const dummyMonthlyMealSchedules = generateMonthlyMeals();

// Discussion IDs for linking replies
const discussionId1 = genId();
const discussionId2 = genId();
const discussionId3 = genId();

export const dummyDiscussions = [
  {
    id: discussionId1,
    user_id: 'demo-user',
    school_id: null,
    title: 'Best study tips for AP exams?',
    content: 'Hey everyone! AP exams are coming up soon. What study strategies have worked best for you? I\'m taking 5 APs this year and need all the help I can get!',
    parent_id: null,
    category: 'academic',
    is_pinned: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    author_name: 'Jordan Taylor',
    author_avatar: null,
    reply_count: 4,
  },
  {
    id: discussionId2,
    user_id: 'demo-user-2',
    school_id: null,
    title: 'Coding Club meeting this Friday!',
    content: 'Reminder: We have a coding club meeting this Friday at 3:30 PM in Room 205. We\'ll be working on our school app project. Snacks provided! 🍕',
    parent_id: null,
    category: 'events',
    is_pinned: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    author_name: 'Alex Chen',
    author_avatar: null,
    reply_count: 3,
  },
  {
    id: discussionId3,
    user_id: 'demo-user-3',
    school_id: null,
    title: 'College application essay help',
    content: 'Would anyone be interested in forming a peer review group for college essays? I think it would be really helpful to get feedback from classmates.',
    parent_id: null,
    category: 'general',
    is_pinned: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    author_name: 'Maya Patel',
    author_avatar: null,
    reply_count: 5,
  },
];

// Replies keyed by parent discussion ID
export const dummyDiscussionReplies: Record<string, Record<string, unknown>[]> = {
  [discussionId1]: [
    { id: genId(), user_id: 'demo-user-4', content: 'Flashcards and spaced repetition worked great for me! I use Anki for AP History and it makes a huge difference.', parent_id: discussionId1, category: 'academic', is_pinned: false, created_at: new Date(Date.now() - 1.5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1.5 * 86400000).toISOString(), author_name: 'Sam Rivera', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-5', content: 'Practice tests are KEY! I do timed practice exams every weekend leading up to the test. CollegeBoard has free ones.', parent_id: discussionId1, category: 'academic', is_pinned: false, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(), author_name: 'Taylor Kim', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-6', content: 'Study groups!! We meet at the library every Tuesday. You should join us 😊', parent_id: discussionId1, category: 'academic', is_pinned: false, created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), author_name: 'Priya Gupta', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-7', content: 'Don\'t forget to take breaks! The Pomodoro technique (25 min work, 5 min break) helped me a lot. Also get enough sleep - pulling all-nighters is counterproductive.', parent_id: discussionId1, category: 'academic', is_pinned: false, created_at: new Date(Date.now() - 0.2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 0.2 * 86400000).toISOString(), author_name: 'Chris Lee', author_avatar: null, school_id: null, title: null },
  ],
  [discussionId2]: [
    { id: genId(), user_id: 'demo-user-8', content: 'Can\'t wait! I\'ve been working on the homepage design all week.', parent_id: discussionId2, category: 'events', is_pinned: false, created_at: new Date(Date.now() - 0.8 * 86400000).toISOString(), updated_at: new Date(Date.now() - 0.8 * 86400000).toISOString(), author_name: 'Jamie Wong', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-9', content: 'Is it okay if I bring a friend who wants to learn to code? She\'s interested in joining!', parent_id: discussionId2, category: 'events', is_pinned: false, created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), author_name: 'Lena Martinez', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-2', content: 'Absolutely! Everyone is welcome. The more the merrier 🎉', parent_id: discussionId2, category: 'events', is_pinned: false, created_at: new Date(Date.now() - 0.3 * 86400000).toISOString(), updated_at: new Date(Date.now() - 0.3 * 86400000).toISOString(), author_name: 'Alex Chen', author_avatar: null, school_id: null, title: null },
  ],
  [discussionId3]: [
    { id: genId(), user_id: 'demo-user-10', content: 'Yes!! I\'d love that. My Common App essay is due soon and I could really use another pair of eyes on it.', parent_id: discussionId3, category: 'general', is_pinned: false, created_at: new Date(Date.now() - 2.5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2.5 * 86400000).toISOString(), author_name: 'Noah Wilson', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-11', content: 'Count me in! Maybe we could meet after school on Wednesdays? The writing center is usually open.', parent_id: discussionId3, category: 'general', is_pinned: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString(), author_name: 'Sophia Davis', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-3', content: 'Great idea! Let\'s do Wednesdays at 3:30pm in the writing center. I\'ll create a sign-up sheet.', parent_id: discussionId3, category: 'general', is_pinned: false, created_at: new Date(Date.now() - 1.8 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1.8 * 86400000).toISOString(), author_name: 'Maya Patel', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-12', content: 'Can we also share supplemental essays? I\'m applying to some of the same schools and comparing approaches would be super helpful.', parent_id: discussionId3, category: 'general', is_pinned: false, created_at: new Date(Date.now() - 1.5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1.5 * 86400000).toISOString(), author_name: 'Ethan Park', author_avatar: null, school_id: null, title: null },
    { id: genId(), user_id: 'demo-user-13', content: 'This is amazing! Our counselor Mrs. Johnson said she\'d be happy to review drafts too if we want professional feedback.', parent_id: discussionId3, category: 'general', is_pinned: false, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(), author_name: 'Isabella Torres', author_avatar: null, school_id: null, title: null },
  ],
};

export const dummyInsights = [
  { id: genId(), user_id: 'demo-user', question_key: 'adjectives', answer: 'Determined, curious, and compassionate. I\'m determined because I never give up on challenges, curious because I love exploring new ideas in STEM, and compassionate because I believe in giving back through volunteering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: genId(), user_id: 'demo-user', question_key: 'major_goals', answer: 'I plan to major in Computer Science with a minor in Environmental Science. My career goal is to develop sustainable technology solutions that address climate change. I\'m particularly interested in AI applications for renewable energy optimization.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: genId(), user_id: 'demo-user', question_key: 'proudest_moment', answer: 'When our debate team made it to state finals for the first time in 5 years. As captain, I spent extra hours coaching our novice members and developing new strategies. Seeing their growth and our collective achievement was incredibly rewarding.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Strengths Finder dummy results
export const dummyStrengthsResults = {
  completed: true,
  topStrengths: [
    { name: 'Analytical Thinking', score: 92, description: 'You excel at breaking down complex problems and finding logical solutions. Your science fair success and coding club reflect this strength.', careers: ['Software Engineer', 'Data Scientist', 'Research Analyst', 'Systems Architect'] },
    { name: 'Leadership', score: 88, description: 'You naturally inspire and guide others. As NHS President and Debate Team Captain, you demonstrate strong organizational and motivational skills.', careers: ['Project Manager', 'Entrepreneur', 'School Administrator', 'Team Lead'] },
    { name: 'Communication', score: 85, description: 'Your debate experience and ability to mentor others shows excellent verbal and written communication abilities.', careers: ['Marketing Director', 'Public Relations', 'Journalist', 'Attorney'] },
    { name: 'Empathy & Service', score: 82, description: 'Your extensive hospital volunteering and community service show deep compassion and commitment to helping others.', careers: ['Healthcare Professional', 'Social Worker', 'Nonprofit Director', 'Counselor'] },
    { name: 'Creativity', score: 78, description: 'Founding a coding club and building school apps demonstrates innovative thinking and the ability to create something from nothing.', careers: ['UX Designer', 'Product Manager', 'Startup Founder', 'Creative Director'] },
  ],
  suggestedPaths: [
    { field: 'Computer Science & Engineering', match: 95, reason: 'Your analytical skills, coding experience, and leadership combine perfectly for tech roles.' },
    { field: 'Pre-Med / Healthcare', match: 82, reason: 'Your empathy, volunteering, and strong science background align with healthcare careers.' },
    { field: 'Business & Entrepreneurship', match: 80, reason: 'Your leadership, communication, and creative problem-solving fit well in business.' },
    { field: 'Environmental Science', match: 75, reason: 'Your science fair research on sustainable energy shows passion for environmental impact.' },
  ],
};

// Dummy AI chat history for presentation mode
export const dummyChatHistory = [
  {
    id: 'chat-1',
    title: 'AP Calculus Study Help',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    messages: [
      { role: 'user' as const, content: 'How do I solve integration by parts problems?' },
      { role: 'assistant' as const, content: 'Integration by parts uses the formula: ∫u dv = uv - ∫v du\n\nHere\'s how to remember which function to pick as "u" — use LIATE:\n\n1. **L**ogarithmic (ln x)\n2. **I**nverse trig (arctan x)\n3. **A**lgebraic (x², x³)\n4. **T**rigonometric (sin x, cos x)\n5. **E**xponential (eˣ)\n\nPick "u" from the top of the list. Let me walk through an example:\n\n**∫ x·eˣ dx**\n- u = x (algebraic), dv = eˣ dx\n- du = dx, v = eˣ\n- = x·eˣ - ∫eˣ dx = x·eˣ - eˣ + C\n\nWant me to do a practice problem with you?' },
      { role: 'user' as const, content: 'Yes! Try ∫ x·sin(x) dx' },
      { role: 'assistant' as const, content: 'Great choice! Let\'s solve ∫ x·sin(x) dx step by step:\n\n**Step 1: Choose u and dv**\n- u = x (algebraic beats trig in LIATE)\n- dv = sin(x) dx\n\n**Step 2: Find du and v**\n- du = dx\n- v = -cos(x)\n\n**Step 3: Apply the formula**\n∫ x·sin(x) dx = x·(-cos x) - ∫(-cos x) dx\n= -x·cos(x) + ∫cos(x) dx\n= -x·cos(x) + sin(x) + C\n\n**Answer: -x·cos(x) + sin(x) + C** ✅\n\nYou can verify by differentiating the answer. Want to try another one?' },
    ],
  },
  {
    id: 'chat-2',
    title: 'History Essay Outline',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    messages: [
      { role: 'user' as const, content: 'Help me outline an essay about the causes of the Civil War' },
      { role: 'assistant' as const, content: 'Here\'s a strong AP US History essay outline on the causes of the Civil War:\n\n## Thesis\nThe Civil War resulted from the intersection of sectional economic differences, the moral debate over slavery, and the failure of political compromise to resolve these tensions.\n\n## Body Paragraph 1: Economic Divisions\n- Northern industrialization vs. Southern agrarian economy\n- Tariff disputes (Tariff of Abominations, 1828)\n- Dependence on enslaved labor for cotton production\n\n## Body Paragraph 2: Slavery as a Moral Issue\n- Abolitionist movement (Frederick Douglass, Harriet Beecher Stowe)\n- Uncle Tom\'s Cabin (1852) shifting public opinion\n- Dred Scott decision (1857)\n\n## Body Paragraph 3: Political Failures\n- Missouri Compromise (1820) and its collapse\n- Compromise of 1850 and Fugitive Slave Act\n- Kansas-Nebraska Act and "Bleeding Kansas"\n- Election of Lincoln (1860) as final trigger\n\n## Conclusion\nTie back to thesis — these interconnected factors made war inevitable.\n\nWant me to help flesh out any section?' },
    ],
  },
  {
    id: 'chat-3',
    title: 'SAT Vocab Tips',
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    messages: [
      { role: 'user' as const, content: 'What\'s the best way to memorize vocabulary for the SAT?' },
      { role: 'assistant' as const, content: 'Here are the most effective strategies for SAT vocabulary:\n\n## 1. 🧠 Spaced Repetition\nUse apps like Anki or Quizlet with spaced repetition. Review words at increasing intervals (1 day, 3 days, 7 days, etc.)\n\n## 2. 📖 Context Over Definitions\nDon\'t just memorize definitions. Read the word in context:\n- "The **ubiquitous** smartphone has transformed daily life" → ubiquitous = found everywhere\n\n## 3. 🔗 Word Roots\nLearn Latin/Greek roots to decode unfamiliar words:\n- **bene** = good (benefit, benevolent, benediction)\n- **mal** = bad (malicious, malfunction, malevolent)\n- **chron** = time (chronological, chronic, synchronize)\n\n## 4. ✍️ Use New Words\nWrite sentences using 5 new words daily. Using words actively cements them.\n\n## 5. 📚 Read Challenging Material\nThe Economist, Atlantic, and classic literature expose you to SAT-level words naturally.\n\nAim for 10-15 new words per day. That\'s 300+ words in a month! Want me to quiz you on some common SAT words?' },
    ],
  },
];
