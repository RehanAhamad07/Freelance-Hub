
export const mockReviews = [
  {
    _id: "r1",
    rating: 5,
    comment: "Absolutely incredible work! The freelancer understood exactly what I needed and delivered perfectly on time. Communication was stellar throughout the whole project.",
    clientName: "John Client",
    createdAt: new Date().toISOString()
  },
  {
    _id: "r2",
    rating: 5,
    comment: "Exceeded all my expectations. The quality of the delivery is extremely high and I will definitely be hiring them again.",
    clientName: "Sarah M.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "r3",
    rating: 4,
    comment: "Great result but there was a slight delay in delivery. Overall very satisfied with the work and would recommend.",
    clientName: "Alex R.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const mockOrders = [
  {
    _id: "o1",
    service: { title: "I will build a custom MERN stack web application", price: 350 },
    status: "in progress",
    price: 350,
    createdAt: new Date().toISOString()
  },
  {
    _id: "o2",
    service: { title: "I will write SEO optimized blog posts", price: 35 },
    status: "completed",
    price: 35,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];
