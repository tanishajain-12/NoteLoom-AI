export const mockUser = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  joinedDate: 'January 2026',
  totalNotes: 47,
  avatar: 'JD',
}

export const mockStats = [
  { label: 'Total Notes', value: '47', icon: 'document', change: '+12 this week' },
  { label: 'Hours Saved', value: '23h', icon: 'clock', change: '+3.5h this week' },
  { label: 'Avg. Accuracy', value: '94%', icon: 'chart', change: '+2% this month' },
  { label: 'Quizzes Taken', value: '18', icon: 'book', change: '+4 this week' },
]

export const mockRecentNotes = [
  {
    id: 1,
    title: 'Introduction to Neural Networks',
    date: 'Jul 10, 2026',
    type: 'Lecture',
    duration: '45 min',
    preview: 'Covers the fundamentals of neural networks including perceptrons, activation functions, and backpropagation algorithms.',
  },
  {
    id: 2,
    title: 'Q3 Product Strategy Meeting',
    date: 'Jul 9, 2026',
    type: 'Meeting',
    duration: '1h 20min',
    preview: 'Discussed Q3 roadmap, prioritized features for the next sprint, and aligned on go-to-market strategy.',
  },
  {
    id: 3,
    title: 'Advanced Data Structures',
    date: 'Jul 7, 2026',
    type: 'Lecture',
    duration: '1h 15min',
    preview: 'Explored balanced trees, graph algorithms, and dynamic programming with practical code examples.',
  },
]

export const mockHistory = [
  {
    id: 1,
    title: 'Introduction to Neural Networks',
    date: 'Jul 10, 2026',
    type: 'Lecture',
    duration: '45 min',
    preview: 'Covers the fundamentals of neural networks including perceptrons, activation functions, and backpropagation algorithms.',
  },
  {
    id: 2,
    title: 'Q3 Product Strategy Meeting',
    date: 'Jul 9, 2026',
    type: 'Meeting',
    duration: '1h 20min',
    preview: 'Discussed Q3 roadmap, prioritized features for the next sprint, and aligned on go-to-market strategy.',
  },
  {
    id: 3,
    title: 'Advanced Data Structures',
    date: 'Jul 7, 2026',
    type: 'Lecture',
    duration: '1h 15min',
    preview: 'Explored balanced trees, graph algorithms, and dynamic programming with practical code examples.',
  },
  {
    id: 4,
    title: 'Marketing Team Standup',
    date: 'Jul 5, 2026',
    type: 'Meeting',
    duration: '30 min',
    preview: 'Weekly sync covering campaign performance, content calendar, and upcoming launch timelines.',
  },
  {
    id: 5,
    title: 'Machine Learning Foundations',
    date: 'Jul 3, 2026',
    type: 'Lecture',
    duration: '1h 30min',
    preview: 'Introduction to supervised and unsupervised learning, model evaluation, and feature engineering techniques.',
  },
  {
    id: 6,
    title: 'Client Onboarding Call',
    date: 'Jul 1, 2026',
    type: 'Meeting',
    duration: '55 min',
    preview: 'Walked new client through platform setup, integration options, and success metrics for the first quarter.',
  },
]

export const mockSummary = {
  title: 'Introduction to Neural Networks',
  date: 'July 10, 2026',
  duration: '45 minutes',
  summary:
    'This lecture introduced the foundational concepts of neural networks, beginning with the biological inspiration behind artificial neurons. The instructor explained the structure of a perceptron, how weights and biases work, and the role of activation functions such as sigmoid, ReLU, and tanh. The session then covered forward propagation, loss functions, and the backpropagation algorithm for training networks via gradient descent. The lecture concluded with a discussion on common architectures like feedforward, convolutional, and recurrent neural networks.',
  keyPoints: [
    'A perceptron is the simplest form of a neural network, taking multiple inputs, applying weights, and producing a binary output.',
    'Activation functions introduce non-linearity, enabling neural networks to learn complex patterns.',
    'ReLU is preferred in deep networks due to its computational efficiency and reduced vanishing gradient problem.',
    'Backpropagation uses the chain rule to compute gradients of the loss with respect to each weight.',
    'Gradient descent updates weights iteratively to minimize the loss function.',
    'Common architectures include feedforward (FNN), convolutional (CNN) for images, and recurrent (RNN) for sequences.',
  ],
  actionItems: [
    'Review the mathematical derivation of backpropagation before the next class.',
    'Implement a simple perceptron in Python using NumPy.',
    'Complete the assigned reading on convolutional neural networks.',
    'Experiment with different activation functions on the provided dataset.',
  ],
  quizQuestions: [
    {
      question: 'What is the primary purpose of an activation function in a neural network?',
      options: [
        'To normalize input data',
        'To introduce non-linearity into the network',
        'To reduce the number of parameters',
        'To speed up training',
      ],
      answer: 1,
    },
    {
      question: 'Which activation function is most commonly used in hidden layers of deep networks?',
      options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'],
      answer: 2,
    },
    {
      question: 'What does backpropagation compute?',
      options: [
        'The forward pass of the network',
        'The gradients of the loss with respect to weights',
        'The number of layers needed',
        'The activation function to use',
      ],
      answer: 1,
    },
    {
      question: 'Which network architecture is best suited for image classification?',
      options: ['Feedforward Neural Network', 'Recurrent Neural Network', 'Convolutional Neural Network', 'Linear Regression'],
      answer: 2,
    },
  ],
}
