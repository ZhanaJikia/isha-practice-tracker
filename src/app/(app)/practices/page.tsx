import { PracticePicker } from "@/app/components/practices/PracticePicker";

export default function PracticesPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <PracticePicker mode="manage" />
    </div>
  );
}