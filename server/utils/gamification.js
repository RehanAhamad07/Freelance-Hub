/**
 * Freelancer Gamification — Level & Commission System
 */

const LEVELS = [
  { level: 1, name: 'Starter', minEarnings: 0, minRating: 0, minJobs: 0, commission: 0.10, color: '#6B7280' },
  { level: 2, name: 'Rising', minEarnings: 500, minRating: 3.5, minJobs: 5, commission: 0.09, color: '#3B82F6' },
  { level: 3, name: 'Pro', minEarnings: 2000, minRating: 4.0, minJobs: 15, commission: 0.07, color: '#F59E0B' },
];

const getFreelancerLevel = (user) => {
  const earnings = user.totalEarnings || 0;
  const rating = user.rating || 0;
  const jobs = user.completedJobs || 0;

  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (earnings >= lvl.minEarnings && rating >= lvl.minRating && jobs >= lvl.minJobs) {
      current = lvl;
    }
  }

  const nextIndex = LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;

  // Progress to next level (0-100%)
  let progress = 100;
  if (next) {
    const earningsProgress = next.minEarnings > 0 ? Math.min(earnings / next.minEarnings, 1) : 1;
    const ratingProgress = next.minRating > 0 ? Math.min(rating / next.minRating, 1) : 1;
    const jobsProgress = next.minJobs > 0 ? Math.min(jobs / next.minJobs, 1) : 1;
    progress = Math.round(((earningsProgress + ratingProgress + jobsProgress) / 3) * 100);
  }

  return {
    level: current.level,
    name: current.name,
    commission: current.commission,
    commissionPercent: Math.round(current.commission * 100),
    color: current.color,
    next: next ? { level: next.level, name: next.name, minEarnings: next.minEarnings, minRating: next.minRating, minJobs: next.minJobs, commissionPercent: Math.round(next.commission * 100) } : null,
    progress,
  };
};

const getCommissionRate = (user) => {
  return getFreelancerLevel(user).commission;
};

const generateReferralCode = (name) => {
  const prefix = (name || 'USER').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`;
};

module.exports = { LEVELS, getFreelancerLevel, getCommissionRate, generateReferralCode };
