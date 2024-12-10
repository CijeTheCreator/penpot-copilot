/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inbox, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

export type FileUploadProps = {
  handleChange: (file: File) => void;
  handling: boolean;
};
const FileUpload = ({ handleChange, handling }: FileUploadProps) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      handleChange(file);
    },
  });

  return (
    <div
      className="p-2 bg-accent rounded-xl dark:border-none border border-foreground-muted w-full"
      onClick={() => {
        open();
      }}
    >
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer   py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {handling ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-100">
              Replacing in place
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 " />
            <p className="mt-2 text-sm text-slate-400">Drop an image here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
