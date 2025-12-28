

export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
