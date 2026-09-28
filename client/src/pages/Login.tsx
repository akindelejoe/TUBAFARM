import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FormInput } from "../components/FormInput";
import { ErrorMessage } from "../components/ErrorMessage";
import { getErrorMessage } from "../services/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-farm-700 py-2.5 font-medium text-white transition-colors hover:bg-farm-800 disabled:opacity-50"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Demo: admin@tubafarm.com / manager@tubafarm.com / worker@tubafarm.com / sales@tubafarm.com
      </p>
    </form>
  );
}
