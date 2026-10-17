import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  Trash2,
  Edit2,
  RotateCcw,
  Filter,
  Sun,
  Moon,
  BarChart3,
  CheckCircle2,
  Target,
  Zap,
  BookOpen,
  Heart,
  Brain,
  Dumbbell,
  Coffee,
  Code,
  Music,
  X,
  Info
} from 'lucide-react';

// --- HELPER FUNCTIONS FOR DATES & STREAKS ---

// Format a Date object to YYYY-MM-DD local string
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse YYYY-MM-DD to a local Date object at midnight
const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Add or subtract days from a Date object
const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

// Get the Monday of the week for a given date
const getStartOfWeek = (date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 is Sun, 1 is Mon...
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(copy.setDate(diff));
};

// Calculate current streak and all-time best streak for a completions map
const calculateStreaks = (completions = {}, todayKey) => {
  const completedDates = Object.keys(completions)
    .filter((k) => completions[k])
    .sort();

  if (completedDates.length === 0) {
    return { current: 0, best: 0, total: 0 };
  }

  // Calculate Best Streak
  let best = 1;
  let temp = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = parseDateKey(completedDates[i - 1]);
    const currDate = parseDateKey(completedDates[i]);
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      temp++;
      if (temp > best) best = temp;
    } else if (diffDays > 1) {
      temp = 1;
    }
  }

  // Calculate Current Active Streak (grace period if today isn't checked yet, checks yesterday)
  let current = 0;
  const todayDate = parseDateKey(todayKey);
  const yesterdayKey = formatDateKey(addDays(todayDate, -1));

  let checkDate = completions[todayKey]
    ? todayDate
    : completions[yesterdayKey]
    ? addDays(todayDate, -1)
    : null;

  if (checkDate) {
    while (completions[formatDateKey(checkDate)]) {
      current++;
      checkDate = addDays(checkDate, -1);
    }
  }

  return {
    current,
    best: Math.max(best, current),
    total: completedDates.length
  };
};

// --- PRESET CONFIGURATIONS ---

const CATEGORIES = [
  { id: 'all', name: 'All Habits' },
  { id: 'Health', name: 'Health & Fitness' },
  { id: 'Mindfulness', name: 'Mindfulness' },
  { id: 'Growth', name: 'Learning & Growth' },
  { id: 'Productivity', name: 'Productivity' }
];

const COLOR_PALETTE = {
  emerald: {
    name: 'Emerald',
    bg: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    ring: 'ring-emerald-500/30',
    hex: '#10b981'
  },
  violet: {
    name: 'Violet',
    bg: 'bg-violet-500',
    hoverBg: 'hover:bg-violet-600',
    lightBg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800/60',
    ring: 'ring-violet-500/30',
    hex: '#8b5cf6'
  },
  amber: {
    name: 'Amber',
    bg: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/60',
    ring: 'ring-amber-500/30',
    hex: '#f59e0b'
  },
  rose: {
    name: 'Rose',
    bg: 'bg-rose-500',
    hoverBg: 'hover:bg-rose-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/60',
    ring: 'ring-rose-500/30',
    hex: '#f43f5e'
  },
  sky: {
    name: 'Sky Blue',
    bg: 'bg-sky-500',
    hoverBg: 'hover:bg-sky-600',
    lightBg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800/60',
    ring: 'ring-sky-500/30',
    hex: '#0ea5e9'
  },
  indigo: {
    name: 'Indigo',
    bg: 'bg-indigo-500',
    hoverBg: 'hover:bg-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    ring: 'ring-indigo-500/30',
    hex: '#6366f1'
  }
};

const ICON_OPTIONS = [
  { id: 'dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'book', label: 'Read', icon: BookOpen },
  { id: 'brain', label: 'Meditate', icon: Brain },
  { id: 'heart', label: 'Wellness', icon: Heart },
  { id: 'zap', label: 'Energy', icon: Zap },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'target', label: 'Focus', icon: Target },
  { id: 'coffee', label: 'Routine', icon: Coffee },
  { id: 'music', label: 'Practice', icon: Music }
];

// Generate realistic demo data relative to today's date
const createDefaultHabits = (todayDate) => {
  const makeHistory = (daysBackPattern) => {
    const map = {};
    daysBackPattern.forEach((offset) => {
      const d = addDays(todayDate, -offset);
      map[formatDateKey(d)] = true;
    });
    return map;
  };

  return [
    {
      id: 'h-1',
      name: 'Morning Hydration & Mobility',
      category: 'Health',
      color: 'emerald',
      icon: 'heart',
      targetPerWeek: 7,
      completions: makeHistory([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13])
    },
    {
      id: 'h-2',
      name: 'Deep Work Session (90m)',
      category: 'Productivity',
      color: 'indigo',
      icon: 'zap',
      targetPerWeek: 5,
      completions: makeHistory([0, 1, 2, 3, 5, 6, 8, 9, 10, 12])
    },
    {
      id: 'h-3',
      name: 'Read 25 Pages',
      category: 'Growth',
      color: 'amber',
      icon: 'book',
      targetPerWeek: 6,
      completions: makeHistory([0, 1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14])
    },
    {
      id: 'h-4',
      name: 'Strength & Cardio Training',
      category: 'Health',
      color: 'rose',
      icon: 'dumbbell',
      targetPerWeek: 4,
      completions: makeHistory([1, 2, 4, 6, 8, 9, 11, 13])
    },
    {
      id: 'h-5',
      name: 'Mindful Evening Reflection',
      category: 'Mindfulness',
      color: 'violet',
      icon: 'brain',
      targetPerWeek: 7,
      completions: makeHistory([0, 1, 2, 3, 4, 5, 7, 8, 9, 10])
    }
  ];
};

export default function App() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  // --- STATE ---
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('habitflow_theme_v1');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('habitflow_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load habits from localStorage:', e);
    }
    return createDefaultHabits(new Date());
  });

  // Week navigation offset (0 = current week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Form states for Add/Edit Modal
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Health');
  const [formColor, setFormColor] = useState('emerald');
  const [formIcon, setFormIcon] = useState('dumbbell');
  const [formTarget, setFormTarget] = useState(5);
  const [formError, setFormError] = useState('');

  // Chart View Mode ('bar' | 'area')
  const [chartMode, setChartMode] = useState('bar');

  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      localStorage.setItem('habitflow_data_v1', JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits:', e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem('habitflow_theme_v1', JSON.stringify(darkMode));
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [darkMode]);

  // --- DERIVED WEEK DATES ---
  const currentWeekMonday = useMemo(() => {
    const baseMonday = getStartOfWeek(today);
    return addDays(baseMonday, weekOffset * 7);
  }, [today, weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekMonday, i);
      const key = formatDateKey(date);
      const dayNameShort = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = date.getDate();
      const isToday = key === todayKey;
      const isFuture = date > today && !isToday;
      return {
        date,
        key,
        dayNameShort,
        monthShort,
        dayNum,
        isToday,
        isFuture
      };
    });
  }, [currentWeekMonday, today, todayKey]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.monthShort === last.monthShort) {
      return `${first.monthShort} ${first.dayNum} – ${last.dayNum}, ${last.date.getFullYear()}`;
    }
    return `${first.monthShort} ${first.dayNum} – ${last.monthShort} ${last.dayNum}, ${last.date.getFullYear()}`;
  }, [weekDays]);

  // --- ENRICHED HABITS & STATS ---
  const enrichedHabits = useMemo(() => {
    return habits.map((h) => {
      const streaks = calculateStreaks(h.completions, todayKey);
      const weekCompletedCount = weekDays.reduce(
        (acc, d) => acc + (h.completions[d.key] ? 1 : 0),
        0
      );
      const weekProgressPct = Math.min(
        100,
        Math.round((weekCompletedCount / (h.targetPerWeek || 7)) * 100)
      );
      return {
        ...h,
        streaks,
        weekCompletedCount,
        weekProgressPct
      };
    });
  }, [habits, todayKey, weekDays]);

  const filteredHabits = useMemo(() => {
    return enrichedHabits.filter((h) => {
      const matchesCat =
        selectedCategory === 'all' || h.category === selectedCategory;
      const matchesQuery = h.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesQuery;
    });
  }, [enrichedHabits, selectedCategory, searchQuery]);

  // --- ANALYTICS FOR WEEKLY CHART & SUMMARY CARDS ---
  const weeklyAnalytics = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) {
      return {
        dailyStats: weekDays.map((d) => ({ ...d, completed: 0, total: 0, rate: 0 })),
        weeklyCompletionRate: 0,
        totalCheckinsThisWeek: 0,
        totalWeeklyTarget: 0,
        completedTodayCount: 0,
        longestActiveStreak: 0,
        allTimeBestStreak: 0
      };
    }

    const dailyStats = weekDays.map((day) => {
      const completed = habits.reduce(
        (sum, h) => sum + (h.completions[day.key] ? 1 : 0),
        0
      );
      const rate = Math.round((completed / totalHabits) * 100);
      return {
        ...day,
        completed,
        total: totalHabits,
        rate
      };
    });

    const totalCheckinsThisWeek = dailyStats.reduce((s, d) => s + d.completed, 0);
    const totalWeeklyTarget = habits.reduce(
      (s, h) => s + (h.targetPerWeek || 7),
      0
    );
    const weeklyCompletionRate =
      totalWeeklyTarget > 0
        ? Math.min(100, Math.round((totalCheckinsThisWeek / totalWeeklyTarget) * 100))
        : 0;

    const completedTodayCount = habits.reduce(
      (s, h) => s + (h.completions[todayKey] ? 1 : 0),
      0
    );

    const longestActiveStreak = Math.max(
      0,
      ...enrichedHabits.map((h) => h.streaks.current)
    );
    const allTimeBestStreak = Math.max(
      0,
      ...enrichedHabits.map((h) => h.streaks.best)
    );

    return {
      dailyStats,
      weeklyCompletionRate,
      totalCheckinsThisWeek,
      totalWeeklyTarget,
      completedTodayCount,
      longestActiveStreak,
      allTimeBestStreak
    };
  }, [habits, weekDays, todayKey, enrichedHabits]);

  // --- HANDLERS ---
  const toggleCompletion = (habitId, dateKey) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const nextCompletions = { ...h.completions };
        if (nextCompletions[dateKey]) {
          delete nextCompletions[dateKey];
        } else {
          nextCompletions[dateKey] = true;
        }
        return { ...h, completions: nextCompletions };
      })
    );
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setFormName('');
    setFormCategory('Health');
    setFormColor('emerald');
    setFormIcon('dumbbell');
    setFormTarget(5);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setFormName(habit.name);
    setFormCategory(habit.category);
    setFormColor(habit.color);
    setFormIcon(habit.icon || 'target');
    setFormTarget(habit.targetPerWeek || 7);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError('Please enter a habit name.');
      return;
    }

    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === editingHabit.id
            ? {
                ...h,
                name: trimmed,
                category: formCategory,
                color: formColor,
                icon: formIcon,
                targetPerWeek: Number(formTarget)
              }
            : h
        )
      );
    } else {
      const newHabit = {
        id: `h-${Date.now()}`,
        name: trimmed,
        category: formCategory,
        color: formColor,
        icon: formIcon,
        targetPerWeek: Number(formTarget),
        completions: {}
      };
      setHabits((prev) => [...prev, newHabit]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitToDelete(null);
  };

  const handleResetDemoData = () => {
    setHabits(createDefaultHabits(today));
    setWeekOffset(0);
    setSelectedCategory('all');
    setConfirmResetOpen(false);
  };

  const renderHabitIcon = (iconId, className = 'w-4 h-4') => {
    const found = ICON_OPTIONS.find((item) => item.id === iconId);
    const IconComp = found ? found.icon : Target;
    return <IconComp className={className} />;
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans pb-16">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    HabitFlow
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Streak Studio
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Daily goal logger & visual streak intelligence
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setConfirmResetOpen(true)}
                title="Reset to sample habits"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Reset Demo</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Habit</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* KPI SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Today's Goals
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {weeklyAnalytics.completedTodayCount}/{habits.length}
                  </span>
                  <span className="text-xs font-semibold text-emerald-500">
                    {habits.length > 0
                      ? `${Math.round(
                          (weeklyAnalytics.completedTodayCount / habits.length) * 100
                        )}%`
                      : '0%'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {weeklyAnalytics.completedTodayCount === habits.length && habits.length > 0
                    ? 'All goals crushed today!'
                    : `${
                        habits.length - weeklyAnalytics.completedTodayCount
                      } remaining for today`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Active Best Streak */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Top Active Streak
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {weeklyAnalytics.longestActiveStreak}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    days
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Keep checking off daily!
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Flame className="w-6 h-6 fill-amber-500/20" />
              </div>
            </div>

            {/* Weekly Target Rate */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Weekly Goal Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {weeklyAnalytics.weeklyCompletionRate}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({weeklyAnalytics.totalCheckinsThisWeek}/
                    {weeklyAnalytics.totalWeeklyTarget})
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Based on weekly habit targets
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* All-Time Record Streak */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  All-Time Record
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {weeklyAnalytics.allTimeBestStreak}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    days
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personal best across habits
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </section>

          {/* WEEK NAVIGATION & FILTER BAR */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Week Switcher Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => setWeekOffset((w) => w - 1)}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{weekRangeLabel}</span>
                </div>
                <button
                  onClick={() => setWeekOffset((w) => w + 1)}
                  disabled={weekOffset >= 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                    weekOffset >= 0
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  Jump to Current Week
                </button>
              )}
            </div>
          </section>

          {/* 7-DAY INTERACTIVE HABIT GRID */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>Weekly Habit Check-In Grid</span>
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {filteredHabits.length} {filteredHabits.length === 1 ? 'habit' : 'habits'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any day cell to log or unlog completion. Streaks automatically recalculate.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter habits..."
                  className="w-full pl-3.5 pr-8 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">No habits matching view</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Add a new daily habit or clear your category filter to start building your weekly streak chain.
                  </p>
                </div>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Habit</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50">
                      <th className="text-left py-3.5 pl-5 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[270px]">
                        Habit & Category
                      </th>
                      {weekDays.map((day) => (
                        <th
                          key={day.key}
                          className={`py-3 px-2 text-center w-14 transition-colors ${
                            day.isToday
                              ? 'bg-emerald-500/5 dark:bg-emerald-500/10'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider ${
                                day.isToday
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {day.dayNameShort}
                            </span>
                            <span
                              className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                day.isToday
                                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {day.dayNum}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-28">
                        Weekly Goal
                      </th>
                      <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-32">
                        Streaks
                      </th>
                      <th className="py-3.5 pl-2 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70">
                    {filteredHabits.map((habit) => {
                      const theme = COLOR_PALETTE[habit.color] || COLOR_PALETTE.emerald;
                      const goalMet = habit.weekCompletedCount >= (habit.targetPerWeek || 7);

                      return (
                        <tr
                          key={habit.id}
                          className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Habit Name & Category badge */}
                          <td className="py-3.5 pl-5 pr-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${theme.lightBg} ${theme.text} border ${theme.border} flex items-center justify-center shrink-0`}
                              >
                                {renderHabitIcon(habit.icon, 'w-4 h-4')}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                                  {habit.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-semibold ${theme.lightBg} ${theme.text}`}
                                  >
                                    {habit.category}
                                  </span>
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                    Target: {habit.targetPerWeek}d/wk
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 7 Day Checkboxes */}
                          {weekDays.map((day) => {
                            const isChecked = !!habit.completions[day.key];
                            return (
                              <td
                                key={day.key}
                                className={`py-3 px-2 text-center ${
                                  day.isToday
                                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10'
                                    : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleCompletion(habit.id, day.key)}
                                  title={`${habit.name} - ${day.monthShort} ${day.dayNum}`}
                                  className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center transition-all duration-150 ${
                                    isChecked
                                      ? `${theme.bg} text-white shadow-md scale-100 hover:opacity-95 active:scale-90`
                                      : day.isFuture
                                      ? 'bg-slate-100/60 dark:bg-slate-800/40 text-transparent border border-dashed border-slate-200 dark:border-slate-700/60 hover:border-slate-400'
                                      : 'bg-slate-100 dark:bg-slate-800/90 text-transparent hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700/70 active:scale-90'
                                  }`}
                                >
                                  <Check
                                    className={`w-4 h-4 stroke-[3] transition-transform duration-150 ${
                                      isChecked ? 'scale-100' : 'scale-0'
                                    }`}
                                  />
                                </button>
                              </td>
                            );
                          })}

                          {/* Weekly Progress Bar */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-full flex items-center justify-between text-xs font-semibold">
                                <span
                                  className={
                                    goalMet
                                      ? theme.text
                                      : 'text-slate-600 dark:text-slate-300'
                                  }
                                >
                                  {habit.weekCompletedCount}/{habit.targetPerWeek}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {habit.weekProgressPct}%
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${theme.bg}`}
                                  style={{ width: `${habit.weekProgressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Current & Best Streaks */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <div
                                className="flex items-center gap-1"
                                title="Current Streak"
                              >
                                <Flame
                                  className={`w-4 h-4 ${
                                    habit.streaks.current > 0
                                      ? 'text-amber-500 fill-amber-500/30'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                                <span className="text-xs font-bold">
                                  {habit.streaks.current}d
                                </span>
                              </div>
                              <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
                              <div
                                className="flex items-center gap-1 text-slate-500 dark:text-slate-400"
                                title="Best Streak"
                              >
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-medium">
                                  {habit.streaks.best}d
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Edit / Delete Actions */}
                          <td className="py-3.5 pl-2 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(habit)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Habit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setHabitToDelete(habit)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete Habit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* VISUAL WEEKLY CHARTS & STREAK LEADERBOARD */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLS: Daily Completion Rate & Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base sm:text-lg font-bold">
                      Weekly Completion Rate & Momentum
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daily percentage of completed habits across {weekRangeLabel}
                  </p>
                </div>

                {/* Toggle Bar vs Trend Curve */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setChartMode('bar')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      chartMode === 'bar'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Daily Bars
                  </button>
                  <button
                    onClick={() => setChartMode('area')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      chartMode === 'area'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Trend Curve
                  </button>
                </div>
              </div>

              {/* CHART VISUALIZATION AREA */}
              {chartMode === 'bar' ? (
                <div className="pt-4 pb-2">
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-6 px-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    {weeklyAnalytics.dailyStats.map((day) => {
                      const heightPct = Math.max(day.rate, 6);
                      return (
                        <div
                          key={day.key}
                          className="flex flex-col items-center h-full justify-end group"
                        >
                          {/* Percentage Tooltip Pill */}
                          <div
                            className={`mb-2 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                              day.isToday
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : day.rate === 100
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {day.rate}%
                          </div>

                          {/* Bar Track */}
                          <div className="w-full max-w-[44px] h-36 bg-slate-100 dark:bg-slate-800/70 rounded-t-xl relative overflow-hidden flex items-end p-1">
                            <div
                              className={`w-full rounded-lg transition-all duration-500 ${
                                day.rate === 100
                                  ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25'
                                  : day.isToday
                                  ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                                  : day.rate > 0
                                  ? 'bg-gradient-to-t from-indigo-500 to-sky-400'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-3 px-2 text-center">
                    {weeklyAnalytics.dailyStats.map((day) => (
                      <div key={day.key} className="flex flex-col items-center">
                        <span
                          className={`text-xs font-bold ${
                            day.isToday
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {day.dayNameShort}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {day.completed}/{day.total} done
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* SVG Area Curve Chart */
                <div className="pt-2 pb-2">
                  <div className="relative h-52 w-full">
                    <svg
                      viewBox="0 0 700 200"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      {[0, 25, 50, 75, 100].map((val) => {
                        const y = 180 - (val / 100) * 150;
                        return (
                          <g key={val}>
                            <line
                              x1="30"
                              y1={y}
                              x2="670"
                              y2={y}
                              stroke="currentColor"
                              className="text-slate-200 dark:text-slate-800"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y={y + 4}
                              className="fill-slate-400 text-[10px]"
                            >
                              {val}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Polygon & Line */}
                      {(() => {
                        const pts = weeklyAnalytics.dailyStats.map((d, idx) => {
                          const x = 60 + idx * 96;
                          const y = 180 - (d.rate / 100) * 150;
                          return { x, y, ...d };
                        });
                        const linePath = pts
                          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                          .join(' ');
                        const areaPath = `${linePath} L ${pts[pts.length - 1].x} 180 L ${
                          pts[0].x
                        } 180 Z`;

                        return (
                          <>
                            <path d={areaPath} fill="url(#areaGrad)" />
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {pts.map((p) => (
                              <g key={p.key}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={p.isToday ? 7 : 5}
                                  className="fill-white dark:fill-slate-900 stroke-emerald-500"
                                  strokeWidth="3"
                                />
                                <text
                                  x={p.x}
                                  y={p.y - 12}
                                  textAnchor="middle"
                                  className="fill-slate-700 dark:fill-slate-200 text-[11px] font-bold"
                                >
                                  {p.rate}%
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="grid grid-cols-7 gap-2 pt-3 px-2 text-center">
                    {weeklyAnalytics.dailyStats.map((day) => (
                      <div key={day.key} className="flex flex-col items-center">
                        <span
                          className={`text-xs font-bold ${
                            day.isToday
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {day.dayNameShort}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {day.completed}/{day.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Insight Strip */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>100% Perfect Day</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block ml-2" />
                  <span>In Progress</span>
                </div>
                <div>
                  Total weekly check-ins:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {weeklyAnalytics.totalCheckinsThisWeek} completions
                  </strong>
                </div>
              </div>
            </div>

            {/* RIGHT COL: Habit Streak Leaderboard & Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base sm:text-lg font-bold">
                      Habit Streak Comparison
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Current vs Best
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                  Compare your active momentum against your personal record for each habit.
                </p>

                <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
                  {enrichedHabits
                    .slice()
                    .sort((a, b) => b.streaks.current - a.streaks.current)
                    .map((habit) => {
                      const theme =
                        COLOR_PALETTE[habit.color] || COLOR_PALETTE.emerald;
                      const maxRef = Math.max(
                        weeklyAnalytics.allTimeBestStreak,
                        7
                      );
                      const currentPct = Math.min(
                        100,
                        Math.round((habit.streaks.current / maxRef) * 100)
                      );
                      const bestPct = Math.min(
                        100,
                        Math.round((habit.streaks.best / maxRef) * 100)
                      );

                      return (
                        <div
                          key={habit.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.bg}`}
                              />
                              <span className="text-xs font-semibold truncate">
                                {habit.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                                {habit.streaks.current}d
                              </span>
                              <span className="text-[11px] text-slate-400">
                                / Best {habit.streaks.best}d
                              </span>
                            </div>
                          </div>

                          {/* Dual bar indicator */}
                          <div className="space-y-1">
                            <div className="w-full h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden relative">
                              {/* Best streak ghost bar */}
                              <div
                                className="h-full rounded-full bg-slate-300 dark:bg-slate-600 absolute left-0 top-0 transition-all duration-300"
                                style={{ width: `${bestPct}%` }}
                              />
                              {/* Current active streak bar */}
                              <div
                                className={`h-full rounded-full ${theme.bg} relative z-10 transition-all duration-300`}
                                style={{ width: `${currentPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Colored bar = Current Streak</span>
                <span>Gray bar = Best Record</span>
              </div>
            </div>
          </section>
        </main>

        {/* ADD / EDIT HABIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHabit} className="p-6 space-y-5">
                {/* Habit Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g., Read 20 Pages, Morning Run..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  {formError && (
                    <p className="text-xs text-rose-500 mt-1">{formError}</p>
                  )}
                </div>

                {/* Category & Weekly Target */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Weekly Target ({formTarget} days)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={formTarget}
                      onChange={(e) => setFormTarget(Number(e.target.value))}
                      className="w-full accent-emerald-500 mt-2.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                      <span>1d</span>
                      <span>4d</span>
                      <span>7d (Daily)</span>
                    </div>
                  </div>
                </div>

                {/* Custom Color Picker */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-6 gap-2.5">
                    {Object.entries(COLOR_PALETTE).map(([key, item]) => {
                      const selected = formColor === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setFormColor(key)}
                          className={`h-9 rounded-xl ${item.bg} flex items-center justify-center transition-transform ${
                            selected
                              ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-slate-400 scale-105'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          title={item.name}
                        >
                          {selected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                    {ICON_OPTIONS.map((item) => {
                      const IconComp = item.icon;
                      const selected = formIcon === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setFormIcon(item.id)}
                          title={item.label}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                            selected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  >
                    {editingHabit ? 'Save Changes' : 'Add Habit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">Delete Habit?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    "{habitToDelete.name}"
                  </strong>
                  ? All logged history and streak records for this habit will be removed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteHabit(habitToDelete.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Delete Habit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESET DEMO DATA MODAL */}
        {confirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">Reset to Demo Habits?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will restore the default sample habits and streak history. Your custom changes will be overwritten.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmResetOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetDemoData}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}