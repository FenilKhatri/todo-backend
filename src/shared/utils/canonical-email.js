const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

const canonicalEmail = (email = "") => {
  const [local = "", domain = ""] = email.trim().toLowerCase().split("@");
  const isGmail = GMAIL_DOMAINS.has(domain);
  let mailbox = local.split("+")[0];
  if (isGmail) mailbox = mailbox.replaceAll(".", "");
  return `${mailbox}@${isGmail ? "gmail.com" : domain}`;
};

export default canonicalEmail;
