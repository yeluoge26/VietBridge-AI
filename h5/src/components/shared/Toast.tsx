interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#111]/90 px-5 py-2.5 text-[13px] text-white shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
}
