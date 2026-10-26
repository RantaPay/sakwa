import { EnquiryForm } from "./enquiry-form";

export function Enquiry() {
  return (
    <section
      id="contact"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 px-4 py-24 md:px-8 lg:grid-cols-12 lg:py-32"
    >
      <div className="lg:col-span-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Enquire
        </p>
        <h2 className="mt-3 max-w-[12ch] text-[clamp(1.85rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">
          Write to a director.
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted">
          Tell us who you are and how much you may wish to put in. A director
          will reply. Nothing is charged to send this message.
        </p>
      </div>
      <div className="reveal bezel lg:col-span-7">
        <div className="bezel-inner relative">
          <EnquiryForm />
        </div>
      </div>
    </section>
  );
}
