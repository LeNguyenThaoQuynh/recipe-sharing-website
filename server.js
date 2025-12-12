const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = 3001;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom login route
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db; // lowdb instance
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    const accessToken = `mock-token-${user.id}-${Date.now()}`;
    res.status(200).json({ accessToken, user: userWithoutPassword });
  } else {
    res.status(400).json('Cannot find user');
  }
});

// Custom register route
server.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  const db = router.db;

  const existingUser = db.get('users').find({ email }).value();

  if (existingUser) {
    res.status(400).json('User already exists');
    return;
  }

  const newUser = {
    id: Date.now(),
    email,
    password, // In a real app, hash this!
    name,
    avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
    bio: '',
    dietaryPreferences: []
  };

  db.get('users').push(newUser).write();
  
  const { password: _, ...userWithoutPassword } = newUser;
  const accessToken = `mock-token-${newUser.id}-${Date.now()}`;
  res.status(201).json({ accessToken, user: userWithoutPassword });
});


server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server with custom auth is running on port ${PORT}`);
});