export const productAreas = [
  {
    key: "wishes", title: "My wishes", colour: "pink", kicker: "The things only you would think to mention.",
    description: "Personal wishes, possessions, pets and messages for the people you love.",
    fields: [
      ["personalWishes", "Personal wishes", "What would you like people to know?", "The things that matter to you, in your own words."],
      ["possessions", "Possessions", "Who gets what?", "Better decided now than over a box of your stuff later."],
      ["pets", "Pets", "What should happen with your pets?", "Who they know, what they need and the routines that keep them happy."],
      ["messages", "Messages", "Any messages to leave?", "A note, a story or simply where something important can be found."],
    ],
  },
  {
    key: "people", title: "My people", colour: "blue", kicker: "Right people. Right information.",
    description: "The people who matter, the roles they might play and who should know what.",
    fields: [
      ["keyPeople", "Key people", "Who are the people to contact?", "Names, relationships and the best way to reach them."],
      ["decisionMaker", "Decision maker", "Who should help make decisions?", "Record the person people should speak to first."],
      ["familyNotes", "Family notes", "Anything useful about family or friends?", "Context that may make an awkward moment a little easier."],
      ["professionalContacts", "Professional contacts", "Which advisers should be contacted?", "Solicitor, accountant, financial adviser or anyone else useful."],
    ],
  },
  {
    key: "sendOff", title: "My send-off", colour: "lime", kicker: "Your send-off. Your say.",
    description: "Music, readings, flowers, food and the kind of goodbye that feels like you.",
    fields: [
      ["farewell", "The farewell", "Burial, cremation, donation—or something else?", "Write down what you want, and what you do not."],
      ["setting", "The setting", "Where should it happen?", "A favourite pub, a woodland, the local crematorium…"],
      ["music", "The soundtrack", "What should everyone hear?", "Bowie. Bach. No hymns. All the hymns."],
      ["details", "The details", "What would make it feel like you?", "Readings, flowers, food, dress, atmosphere and personal requests."],
    ],
  },
  {
    key: "importantStuff", title: "My important stuff", colour: "cream", kicker: "No one knows where anything is. Until now.",
    description: "A useful map of what exists, who provides it and where the paperwork lives.",
    fields: [
      ["insurance", "Insurance", "What insurance exists?", "Provider names, policy type and where the documents are kept—not passwords."],
      ["property", "Property", "What should people know about property?", "Addresses, ownership context and where the relevant paperwork is."],
      ["money", "Money and pensions", "Which providers or advisers should people know about?", "Names and document locations only. Never add passwords, PINs or card details."],
      ["household", "Household", "Which bills, subscriptions or utilities matter?", "A practical list of providers and where account information is safely stored."],
    ],
  },
  {
    key: "vault", title: "My vault", colour: "navy", kicker: "A calm place for the sensitive stuff.",
    description: "Record what important documents exist and where they can safely be found.",
    fields: [
      ["documents", "Important documents", "Which documents should people look for?", "Wills, policies, certificates or deeds—and where each is stored."],
      ["storage", "Safe storage", "Where are physical documents kept?", "For example: the blue folder in the study. Do not add safe codes or PINs."],
      ["digitalAccess", "Digital access", "How should people find your digital emergency information?", "For example: My passwords are in 1Password; my partner knows how to access the emergency kit."],
      ["advisers", "Trusted advisers", "Who can help locate or explain things?", "Professional names and contact details, not login credentials."],
    ],
  },
];

export const pricing = [
  { name: "Annual", price: "£29", suffix: "/ year", description: "Keep your plan current, private and ready." },
  { name: "Lifetime", price: "£75", suffix: "once", description: "Pay once. Keep Good Grief for good." },
];

export const planSteps = productAreas.flatMap((area) => area.fields.map(([field, title, prompt, placeholder]) => ({
  key: `${area.key}.${field}`, areaKey: area.key, field, areaTitle: area.title, title, prompt, placeholder,
})));
