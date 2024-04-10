export function getNameWithFamilyNameInitial(name: string): string {
  return `${name.split(' ')[0]} ${name.split(' ')[1][0]}`;
}

export function getNameFromEmail(email: string): string {
  const fullName = email.substring(0, email.lastIndexOf('@')).replace('.', ' ');
  return fullName.replace(/(^\w{1}|-+\w{1}|\s+\w{1})/g, letter => letter.toUpperCase());

  // ABOUT THE REGEX
  // ^\w{1} matches the first letter of the first name.
  // -+\w{1} matches this first letter of the first/last name if it has an hyphen.
  // \s+\w{1} matches the first letter of the last name followed by a space.
}
