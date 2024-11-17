import { Button } from "@/components/ui/button";

function SuccessfulMessage(props: {
  settempToken: Function;
  setqrCode: Function;
}) {
  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
      <h2 className="text-xl font-semibold">
        2 Factor Authentication Successful
      </h2>
      <Button
        onClick={() => {
          props.settempToken("");
          props.setqrCode("");
        }}
      >
        Submit
      </Button>
    </div>
  );
}

export default SuccessfulMessage;
