import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  getAuth
} from "firebase/auth";
import { useState } from "react";

const PasswordSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // instantiate the auth service SDK
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  // Handle user sign up with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Pull out user's data from the userCredential property
      const user = userCredential.user;
    } catch (err) {
      // Handle errors here
      const errorMessage = err.message;
      const errorCode = err.code;

      setError(true);

      switch (errorCode) {
        case "auth/weak-password":
          setErrorMessage("The password is too weak.");
          break;
        case "auth/email-already-in-use":
          setErrorMessage(
            "This email address is already in use by another account."
          );
        case "auth/invalid-email":
          setErrorMessage("This email address is invalid.");
          break;
        case "auth/operation-not-allowed":
          setErrorMessage("Email/password accounts are not enabled.");
          break;
        default:
          setErrorMessage(errorMessage);
          break;
      }
    }
  };

  return (
    <div className='signupContainer'>
      <div className='signupContainer__box'>
        <div className='signupContainer__box__inner'>
          <h1>Sign Up</h1>
          <form className='signupContainer__box__form' onSubmit={handleSubmit}>
            <input
              type='email'
              placeholder='Email'
              onChange={handleChange}
              name='email'
              value={email}
            />
            <input
              type='password'
              placeholder='Password'
              onChange={handleChange}
              name='password'
              value={password}
            />
            <button type='submit'>Sign Up</button>
            {error && <p>{errorMessage}</p>}
          </form>

          <div className='signupContainer__box__login'>
            <p>
              Already have an account? <Link to='/signin'>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordSignUp;