import { useForm } from "react-hook-form";
import { useEffect } from "react";
import Headers from "./Header";
import { createDefaultFilter } from "./global-filter";
import "./styles.css";

export default function App() {
  // Enable global input filtering using the generic implementation
  useEffect(() => {
    const filter = createDefaultFilter();
    filter.init();

    // Cleanup on component unmount
    return () => filter.destroy();
  }, []);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: "",
      email: "",
      username: "",
    },
  });

  return (
    <div>
      <Headers />
      <h2>The @ and # should be filtered out</h2>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <div style={{ marginBottom: "10px" }}>
          <input {...register("firstName")} placeholder="First Name" />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input {...register("email")} placeholder="Email" />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input {...register("username")} placeholder="Username" />
        </div>
        <input type="submit" />
      </form>
    </div>
  );
}
