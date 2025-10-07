import bcrypt from "bcryptjs";

const test = async () => {
  const ok = await bcrypt.compare(
    "saman",
    "$2b$10$KRsPukqv6OUK5ld7sdZXN.vjVkG2MIGjAIdQjcNYz/zdQ66KS9Heq"
  );
  console.log("Password match:", ok);
};

test();
