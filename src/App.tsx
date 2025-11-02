import { useForm } from "react-hook-form";
import Headers from "./Header";
import "./styles.css";

export default function App() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: ""
    }
  });

  return (
    <div>
      <Headers />

      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <input {...register("firstName")} placeholder="First Name" />
        <input type="submit" />
      </form>
    </div>
  );
}
