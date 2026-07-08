const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (e) {
  console.warn('Gemini AI init skipped — no valid API key');
}

// ─── Template-based fallbacks (no API key needed) ───

const fallbackJobDescription = (title, category, skills = [], budget, deliveryTime) => {
  const skillList = skills.length > 0 ? skills.join(', ') : 'relevant technical skills';
  return `We are looking for a skilled professional to help us with "${title}".

**Project Overview:**
This ${category || 'freelance'} project requires an experienced individual who can deliver high-quality results within the specified timeline. The ideal candidate will bring both technical expertise and creative problem-solving to ensure the project exceeds expectations.

**Key Responsibilities:**
- Understand the project requirements and provide a clear execution plan
- Deliver work that meets professional quality standards
- Communicate progress regularly and be open to feedback
- Complete all deliverables within the agreed timeline${deliveryTime ? ` (${deliveryTime})` : ''}

**Required Skills:**
${skills.length > 0 ? skills.map(s => `- ${s}`).join('\n') : '- Proficiency in relevant tools and technologies\n- Strong attention to detail\n- Excellent communication skills'}

**What Success Looks Like:**
A completed project that meets all requirements, delivered on time, with professional quality that we can build upon. We value clear communication and a collaborative working relationship.

${budget ? `**Budget:** $${budget} (negotiable for the right candidate)` : ''}

We look forward to reviewing your proposal!`;
};

const fallbackCoverLetter = (freelancerName, freelancerBio, freelancerSkills = [], jobTitle, jobDescription) => {
  const relevantSkills = freelancerSkills.length > 0 ? freelancerSkills.slice(0, 4).join(', ') : 'relevant expertise';
  const bioSnippet = freelancerBio ? freelancerBio.substring(0, 100) : 'a dedicated professional with proven experience';
  
  return `Hi there,

I came across your project "${jobTitle}" and I'm very excited about the opportunity to work with you on this.

**Why I'm a great fit:**
As ${bioSnippet}, I bring hands-on experience in ${relevantSkills} that directly aligns with what you're looking for. I've successfully completed similar projects and understand the nuances involved in delivering quality results.

**My approach:**
I believe in starting with a thorough understanding of your vision and goals. I'll create a clear roadmap with milestones so you always know the progress. Communication is key — I'm responsive and open to feedback throughout the process.

**What you can expect:**
- Professional, high-quality deliverables
- Regular progress updates and transparent communication
- Timely delivery with attention to every detail
- Post-delivery support to ensure everything meets your expectations

I'd love to discuss this project further and share some relevant examples from my portfolio. I'm confident I can deliver results that exceed your expectations.

Looking forward to hearing from you!

Best regards,
${freelancerName || 'Your Freelancer'}`;
};

// ─── AI-powered generation (with smart fallback) ───

/**
 * Generate a professional job description using Gemini AI
 * Falls back to template-based generation if API key is missing or fails
 */
const generateJobDescription = async (title, category, skills = [], budget, deliveryTime) => {
  // Try Gemini API first
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are an expert freelance marketplace copywriter. Generate a professional, detailed job description for a freelance project.

Job Title: ${title}
Category: ${category}
Required Skills: ${skills.join(', ') || 'Not specified'}
Budget: $${budget || 'Flexible'}
Timeline: ${deliveryTime || 'Flexible'}

Write a compelling job description that includes:
1. A brief overview of the project (2-3 sentences)
2. Key responsibilities and deliverables (bullet points)
3. Requirements and qualifications
4. What a successful outcome looks like

Keep it professional, concise (200-300 words), and use markdown-compatible formatting. Do NOT include the title or budget in the description — just the body text.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API failed, using template fallback:', error.message);
    }
  }

  // Fallback to template
  console.log('Using template-based job description generation');
  return fallbackJobDescription(title, category, skills, budget, deliveryTime);
};

/**
 * Generate a high-converting proposal cover letter using Gemini AI
 * Falls back to template-based generation if API key is missing or fails
 */
const generateProposalCoverLetter = async (freelancerName, freelancerBio, freelancerSkills = [], jobTitle, jobDescription) => {
  // Try Gemini API first
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are an expert freelance proposal writer. Write a professional, high-converting cover letter for a freelancer applying to a job.

Freelancer Name: ${freelancerName}
Freelancer Bio: ${freelancerBio || 'Experienced professional'}
Freelancer Skills: ${freelancerSkills.join(', ') || 'Various'}

Job They Are Applying To:
Title: ${jobTitle}
Description: ${jobDescription || 'Not provided'}

Write a cover letter that:
1. Opens with a compelling hook showing understanding of the client's needs
2. Highlights relevant experience and skills that match the job
3. Describes the approach they would take
4. Ends with a confident call to action

Keep it professional, personalized (150-250 words), and persuasive. Write in first person. Do NOT use generic templates — make it specific to this job.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API failed, using template fallback:', error.message);
    }
  }

  // Fallback to template
  console.log('Using template-based cover letter generation');
  return fallbackCoverLetter(freelancerName, freelancerBio, freelancerSkills, jobTitle, jobDescription);
};

module.exports = { generateJobDescription, generateProposalCoverLetter };
