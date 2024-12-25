import { useState } from "react";
import fileIcon from "/file.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import Tiptap from "./subcomponents/tiptap";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import FormPreview from "./subcomponents/FormPreview";
interface data {
  affectedHost: string[];
  attachments: FileList;
  attackComplexity: string;
  attackVector: string;
  availability: string;
  confidentiality: string;
  description: string;
  impact: string;
  integrity: string;
  likeliHood: string;
  privilegesRequired: string;
  recommendedSolution: string;
  scope: string;
  severity: string;
  stepToReproduce: string;
  title: string;
  userInterction: string;
}
const formSchema = z.object({
  affectedHost: z.array(z.string()),
  title: z.string().min(3, "Title must be atleast three characters long."),
  severity: z.string(),
  description: z.string().min(1, "Description is reqired."),
  stepToReproduce: z.string().min(1, "This is a reqired field."),
  recommendedSolution: z.string().min(1, "This is a reqired field."),
  impact: z.string().min(1, "This is a reqired field."),
  likeliHood: z.string().min(1, "This is a reqired field."),
  attackVector: z.string().min(1, "This is a reqired field."),
  attackComplexity: z.string().min(1, "This is a reqired field."),
  privilegesRequired: z.string().min(1, "This is a reqired field."),
  userInterction: z.string().min(1, "This is a reqired field."),
  scope: z.string().min(1, "This is a reqired field."),
  confidentiality: z.string().min(1, "This is a reqired field."),
  integrity: z.string().min(1, "This is a reqired field."),
  availability: z.string().min(1, "This is a reqired field."),
  attachments: z
    .custom<FileList>((val) => val instanceof FileList, "Please upload a file")
    .refine((files) => files.length > 0, "At least one file is required"),
});

function ReportsForm(props: { setForm: Function }) {
  const [preview, setPreview] = useState(false);
  const [data, setData] = useState<data | undefined>(undefined);
  const [hosts, setHosts] = useState<Array<string>>([]);
  const [hostsError, setHostsError] = useState(false)

  const handleValueChange = (value: string) => {
    setHostsError(false)
    setHosts((prevHosts) => {
      // Check if the value is already in the array
      if (!prevHosts.includes(value)) {
        // If it's not, add it to the array
        return [...prevHosts, value];
      }
      // If it's already in the array, return the current state
      return prevHosts;
    });
  };

  const handleUnselect = (item: string) => {
    setHosts((prevHosts) => prevHosts.filter((host) => host !== item));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      affectedHost: hosts,
      title: "",
      severity: "low",
      description: "",
      stepToReproduce: "",
      recommendedSolution: "",
      attackComplexity: "low",
      attackVector: "network",
      availability: "none",
      confidentiality: "none",
      impact: "",
      integrity: "none",
      likeliHood: "",
      privilegesRequired: "none",
      scope: "unchanged",
      userInterction: "none",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    if(hosts.length===0)
      setHostsError(true)
    else{
      setHostsError(false)
    form.setValue("affectedHost", hosts); // Sync affectedHost with hosts state
    console.log({ ...values, affectedHost: hosts });
    setData({ ...values, affectedHost: hosts });
    setPreview(true);
    }
  }
  if (!preview) {
    return (
      <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-8 font-poppins sm:mx-6"
        >
          <div className="sm:w-9/12 flex flex-col gap-6 p-6 bg-white rounded-lg">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium">
                Submit vulnerability report
              </h2>
              <p>
                Provide detailed information to ensure easy validation and
                review. Include affected hosts, severity, CVSS metrics, steps to
                reproduce, and relevant attachments for a thorough report. All
                fields are mandatory unless marked as optional.{" "}
              </p>
            </div>
            <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-medium">1. Affected Host (s)</h1>
            <label>Affected Host (s)</label>
            <Select value="" onValueChange={handleValueChange}>
              <SelectTrigger className="sm:w-3/5">
                <SelectValue placeholder="Select from the pre-defined list of hosts" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="sub3.digitalcircle.com">
                    sub3.digitalcircle.com
                  </SelectItem>
                  <SelectItem value="sub2.digitalcircle.com">
                    sub2.digitalcircle.com
                  </SelectItem>
                  <SelectItem value="sub1.digitalcircle.com">
                    sub1.digitalcircle.com
                  </SelectItem>
                  <SelectItem value="10x.digitalcircle.com">
                    10x.digitalcircle.com
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {hostsError && <span className="text-red-600 -my-5">Add atleast one host</span>}
            <div className="flex flex-col sm:flex-row gap-2">
              {hosts.map((host) => {
                return (
                  <Badge
                    key={host}
                    variant="secondary"
                    className="flex justify-between"
                  >
                    {host}
                    <Button
                      className="ml-2 w-7 h-7 p-0 bg-inherit rounded-full"
                      onClick={() => handleUnselect(host)}
                    >
                      <X className="h-5 w-5 text-black hover:text-white" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            </div>
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-medium">2. Basic Details</h1>
              <div className="flex gap-6 flex-col lg:flex-row">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:w-3/5">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Add a title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem className="sm:w-2/5">
                      <FormLabel>Severity</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                          {...field}
                        >
                          {["Low", "Medium", "High", "Critical"].map(
                            (level) => (
                              <FormLabel
                                key={level.toLowerCase()}
                                htmlFor={level.toLowerCase()}
                                className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                              >
                                <RadioGroupItem
                                  value={level.toLowerCase()}
                                  id={level.toLowerCase()}
                                  className="sr-only"
                                />
                                {level}
                              </FormLabel>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      {/* Tiptap Editor */}
                      <Tiptap
                        description={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h1 className="text-2xl font-medium">
                3. Recommendations and Steps to Reproduce
              </h1>

              <FormField
                control={form.control}
                name="stepToReproduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>steps to Reproduce</FormLabel>
                    <FormControl>
                      {/* Tiptap Editor */}
                      <Tiptap
                        description={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommendedSolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended Solution</FormLabel>
                    <FormControl>
                      {/* Tiptap Editor */}
                      <Tiptap
                        description={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h1 className="text-2xl font-medium">4. Impact and Likelihood</h1>
              <div className="flex flex-col sm:flex-row gap-6 sm:w-10/12">
                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem className="sm:w-2/5">
                      <FormLabel>Impact</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="h-20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="likeliHood"
                  render={({ field }) => (
                    <FormItem className="3/5">
                      <FormLabel>LikeliHood</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="h-20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-medium">5. CVSS Metrics</h1>
                <FormField
                  control={form.control}
                  name="attackVector"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Attack Vector</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                          {...field}
                        >
                          {["Network", "Adjacent", "Local", "Physical"].map(
                            (level) => (
                              <FormLabel
                                key={level.toLowerCase()}
                                htmlFor={level.toLowerCase()}
                                className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                              >
                                <RadioGroupItem
                                  value={level.toLowerCase()}
                                  id={level.toLowerCase()}
                                  className="sr-only"
                                />
                                {level}
                              </FormLabel>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attackComplexity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Attack Complexity</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex"
                        >
                          {["Low", "High"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`attackComplexity-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`attackComplexity-${level.toLowerCase()}`} // Matches the unique ID
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privilegesRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">
                        Privileges Required
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["None", "Low", "High"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`privilegesRequired-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`privilegesRequired-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userInterction"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">User interction</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["None", "Reqired"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`userInterction-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`userInterction-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Scope</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["Unchanged", "Changed"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`scope-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`scope-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confidentiality"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Confidentiality</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["None", "Low", "High"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`confidentiality-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`confidentiality-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="integrity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Integrity</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["None", "Low", "High"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`integrity-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`integrity-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row sm:items-center sm:gap-12">
                      <FormLabel className="w-40">Availability</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex"
                        >
                          {["None", "Low", "High"].map((level) => (
                            <FormLabel
                              key={level.toLowerCase()}
                              htmlFor={`availability-${level.toLowerCase()}`}
                              className="cursor-pointer rounded px-4 py-2 text-xs sm:text-sm border transition-colors [&:has(:checked)]:bg-primary-900 [&:has(:checked)]:text-primary-foreground hover:bg-muted"
                            >
                              <RadioGroupItem
                                value={level.toLowerCase()}
                                id={`availability-${level.toLowerCase()}`}
                                className="sr-only"
                              />
                              {level}
                            </FormLabel>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <h1 className="text-2xl font-medium">6. Attachments</h1>
              <FormField
                control={form.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem className="flex w-full sm:col-span-3 flex-col items-start gap-2">
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center gap-2 rounded-formInput border border-dashed bg-[#F5F5F5] border-inputBorder p-2.5 self-stretch">
                        <div className="flex flex-col items-center gap-2 self-stretch">
                          <img className="" src="/papers.svg" />
                          <div className="flex w-3/5 sm:w-auto px-4 justify-center items-center sm:gap-8 border rounded-formInput border-[#353086]">
                            <img src={fileIcon} />
                            <Input
                              type="file"
                              multiple
                              placeholder="Choose files"
                              className="border-none"
                              onChange={(e) => {
                                const newFiles = e.target.files;
                                const currentFiles =
                                  field.value || new DataTransfer().files; // Use an empty FileList if none
                                const dataTransfer = new DataTransfer();

                                // Append existing files
                                Array.from(currentFiles).forEach((file) => {
                                  dataTransfer.items.add(file);
                                });

                                // Append new files
                                Array.from(newFiles || []).forEach((file) => {
                                  dataTransfer.items.add(file);
                                });

                                // Update the field with the combined FileList
                                field.onChange(dataTransfer.files);
                              }}
                            />
                          </div>
                          <label className="font-poppins text-inputBorder text-base lowercase font-medium">
                            or drop files here
                          </label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white rounded-md p-6 flex flex-col gap-6 h-fit sm:w-3/12">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center h-auto">
                  <img
                    src="https://www.google.com/imgres?q=image&imgurl=https%3A%2F%2Fimages.ctfassets.net%2Fhrltx12pl8hq%2F28ECAQiPJZ78hxatLTa7Ts%2F2f695d869736ae3b0de3e56ceaca3958%2Ffree-nature-images.jpg%3Ffit%3Dfill%26w%3D1200%26h%3D630&imgrefurl=https%3A%2F%2Fwww.shutterstock.com%2Fdiscover%2Ffree-nature-images&docid=uEeA4F2Pf5UbvM&tbnid=0E5dDA82VanW3M&vet=12ahUKEwiu3ZWHpqCKAxUy_7sIHVLoEyQQM3oFCIABEAA..i&w=1200&h=630&hcb=2&ved=2ahUKEwiu3ZWHpqCKAxUy_7sIHVLoEyQQM3oFCIABEAA"
                    className="w-16 h-16 rounded-full"
                  />
                  <p className="text-2xl font-medium">Pentest Title</p>
                </div>
                <p className="text-[#3A3B3D]">
                  A penetration test, or pentest, is a simulated cyber attack
                  against your computer system to check for vulnerabilities that
                  an attacker could exploit. It involves assessing the security
                  of the system by attempting to breach various application
                  systems, including APIs, frontend/backend servers, and network
                  services. The goal is to identify weaknesses before they can
                  be exploited by malicious actors.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Client:</h4>
                <div className="flex gap-2 items-center">
                  <img
                    src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fimages&psig=AOvVaw3FdtJ4GlxRELqo-1yse3A2&ust=1734026455232000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKjahIymoIoDFQAAAAAdAAAAABAE"
                    className="w-8 h-8 rounded-full"
                  />
                  <p>Digital Circle (Cloud Hosting Services)</p>
                </div>
              </div>

              <div className="h-0.5 bg-gradient-to-r from-white via-[#3D3D3D47] to-white"></div>

              <div className="flex gap-4">
                <Button
                  variant={"outline"}
                  onClick={() => props.setForm(false)}
                >
                  Go Back
                </Button>
                <Button type="submit" className="w-2/3">
                  Submit Vulnerability
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
      </div>
    );
  } else {
    return (
      <>
        <FormPreview data={data} setPreview={setPreview} />
      </>
    );
  }
}

export default ReportsForm;
