import { Button } from "@/components/ui/button";
import FileAttachmentPreview from "./FileAttachmentsPreview";
import CommentSection from "./CommentSection";

interface data {
  affectedHost: string[]; // Array of affected host strings
  attachments: FileList; // FileList object for attachments
  attackComplexity: string; // e.g., "low", "medium", "high"
  attackVector: string; // e.g., "network", "local"
  availability: string; // Impact on availability, e.g., "none"
  confidentiality: string; // Impact on confidentiality, e.g., "none"
  description: string; // HTML content as a string
  impact: string; // General impact description
  integrity: string; // Impact on integrity, e.g., "none"
  likeliHood: string; // Likelihood of attack, e.g., "low", "medium", "high"
  privilegesRequired: string; // Privilege requirement, e.g., "none", "low"
  recommendedSolution: string; // HTML content for solutions
  scope: string; // Scope impact, e.g., "unchanged", "changed"
  severity: string; // Severity level, e.g., "low", "medium", "high"
  stepToReproduce: string; // HTML content for reproduction steps
  title: string; // Title of the report
  userInterction: string; // User interaction requirement, e.g., "none"
}

function formPreview(props: {
  data: data | undefined;
  setPreview: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-8 font-poppins mx-6">
      <div className="sm:w-9/12 flex flex-col gap-6">
        <div className="w-full flex flex-col gap-6 p-6 bg-white rounded-lg">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-medium">
              Submit vulnerability report
            </h2>
            <p>
              Provide detailed information to ensure easy validation and review.
              Include affected hosts, severity, CVSS metrics, steps to
              reproduce, and relevant attachments for a thorough report. All
              fields are mandatory unless marked as optional.{" "}
            </p>
          </div>
          <h1 className="text-2xl font-medium mb-6">1. Affected Host (s)</h1>
          <div className="flex flex-col gap-4">
            <p className="font-medium">Affected Host (s)</p>
            <ul className="px-6">
              {props.data?.affectedHost.map((host, i) => {
                return (
                  <li key={i} className="text-previewText list-disc">
                    {host}
                  </li>
                );
              })}
            </ul>
          </div>

          <h1 className="text-2xl font-medium mb-6">2. Basic Details (s)</h1>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Title</p>
            <p className="text-previewText">{props.data?.title}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Severity</p>
            <p className="text-previewText">{props.data?.severity}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Description</p>
            {/* <p className="text-previewText">{props.data.description}</p> */}
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: props.data?.description || "",
              }}
            ></div>
          </div>

          <h1 className="text-2xl font-medium mb-6">
            3. Recommendations and Steps to Reproduce (s)
          </h1>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Steps to Reproduce</p>
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: props.data?.stepToReproduce || "",
              }}
            ></div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Recommended Solution</p>
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: props.data?.recommendedSolution || "",
              }}
            ></div>
          </div>

          <h1 className="text-2xl font-medium mb-6">
            4. Impact and Likelihood (s)
          </h1>
          <div className="grid sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="font-medium">Impact</p>
              <p className="text-previewText">{props.data?.impact}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium">LikeliHood</p>
              <p className="text-previewText">{props.data?.likeliHood}</p>
            </div>
          </div>

          <h1 className="text-2xl font-medium mb-6">5. CVSS Metrics</h1>
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Attack vector</p>
                <p className="text-previewText">{props.data?.attackVector}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Privileges Required</p>
                <p className="text-previewText">
                  {props.data?.privilegesRequired}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Scope</p>
                <p className="text-previewText">{props.data?.scope}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Integrity</p>
                <p className="text-previewText">{props.data?.integrity}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Attack Complexity</p>
                <p className="text-previewText">
                  {props.data?.attackComplexity}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">User Interction</p>
                <p className="text-previewText">{props.data?.userInterction}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Confidentiality</p>
                <p className="text-previewText">
                  {props.data?.confidentiality}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Availability</p>
                <p className="text-previewText">{props.data?.availability}</p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-medium mb-6">6. Attachments</h1>
          <FileAttachmentPreview attachments={props.data?.attachments} />
        </div>
        <CommentSection />
      </div>

      <div className=" flex flex-col gap-6 h-fit sm:w-3/12">
        <div className="flex flex-col gap-6 fixed bg-white rounded-md p-6 right-5 sm:w-3/12">
          {" "}
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
                an attacker could exploit. It involves assessing the security of
                the system by attempting to breach various application systems,
                including APIs, frontend/backend servers, and network services.
                The goal is to identify weaknesses before they can be exploited
                by malicious actors.
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
                onClick={() => props.setPreview(false)}
              >
                Go Back
              </Button>
              <Button>Submit Vulnerability</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default formPreview;
