import { Phone, Mail, Globe } from "lucide-react";

export const Contact = ({ phone, email, website }) => {
  if (!phone && !email && !website) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-white text-sm font-medium">{phone}</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-white text-sm font-medium break-all">
            {email}
          </span>
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-white text-sm font-medium break-all">
            {website}
          </span>
        </a>
      )}
    </div>
  );
};
