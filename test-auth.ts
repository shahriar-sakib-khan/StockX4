import ky from 'ky';
async function test() {
  try {
    const login = await ky.post('http://localhost:3001/auth/login', {
      json: { email: 'sakib@gmail.com', password: 'password123' } // Need real credentials. Or register a new test user.
    }).json();
    console.log("Login OK:", login);
  } catch(e) { console.error("Login failed:", e); }
}
test();
