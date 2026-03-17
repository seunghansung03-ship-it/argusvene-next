import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setStoredSessionUser } from "../lib/session";

export function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await api.login({ name });
      setStoredSessionUser(user);
      navigate("/");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="eyebrow">Live meeting operating system</div>
        <h1>ArgusVene</h1>
        <p className="login-copy">
          Enter with the name you want other people in the room to see. We will use this identity across
          workspace membership, transcript authorship, and meeting operations.
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Seongseunghan"
              value={name}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Entering room system..." : "Enter ArgusVene"}
          </button>
        </form>
      </section>
    </div>
  );
}
