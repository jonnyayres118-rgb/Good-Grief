export const productAreas = [
  {
    key: "wishes", title: "My wishes", colour: "pink", kicker: "The things only you would think to mention.",
    description: "Personal wishes, possessions, pets and messages for the people you love.",
    fields: [
      ["personalWishes", "Personal wishes", "What would you like people to know?", "The things that matter to you, in your own words.", ["What matters most to me", "How I would like to be remembered", "One thing people should know"]],
      ["possessions", "Possessions", "Who gets what?", "Better decided now than over a box of your stuff later.", ["Something with sentimental value", "A collection or valuable item", "Anything people might disagree about"]],
      ["pets", "Pets", "What should happen with your pets?", "Who they know, what they need and the routines that keep them happy.", ["Who I would like to care for them", "Their everyday routine", "Vet, food and medication details"]],
      ["messages", "Messages", "Any messages to leave?", "A note, a story or simply where something important can be found.", ["A message for everyone", "Something for one particular person", "Where a longer letter can be found"]],
    ],
  },
  {
    key: "people", title: "My people", colour: "blue", kicker: "Right people. Right information.",
    description: "The people who matter, the roles they might play and who should know what.",
    fields: [
      ["keyPeople", "Key people", "Who are the people to contact?", "Names, relationships and the best way to reach them.", ["Immediate family and closest friends", "Someone who can contact everyone else", "Anyone who may otherwise be missed"]],
      ["decisionMaker", "Decision maker", "Who should help make decisions?", "Record the person people should speak to first.", ["The person I trust to lead", "Who should be consulted", "How I would like disagreements handled"]],
      ["familyNotes", "Family notes", "Anything useful about family or friends?", "Context that may make an awkward moment a little easier.", ["Relationships worth explaining", "People who should be seated together", "Anything sensitive to handle gently"]],
      ["professionalContacts", "Professional contacts", "Which advisers should be contacted?", "Solicitor, accountant, financial adviser or anyone else useful.", ["My solicitor or executor", "My accountant or financial adviser", "Another professional who knows my affairs"]],
    ],
  },
  {
    key: "sendOff", title: "My send-off", colour: "lime", kicker: "Your send-off. Your say.",
    description: "Music, readings, flowers, food and the kind of goodbye that feels like you.",
    fields: [
      ["farewell", "The farewell", "Burial, cremation, donation—or something else?", "Write down what you want, and what you do not.", ["The kind of farewell I want", "Something I definitely do not want", "Whether I have discussed this with anyone"]],
      ["setting", "The setting", "Where should it happen?", "A favourite pub, a woodland, the local crematorium…", ["A place that feels right", "Indoors, outdoors or no preference", "Where people could gather afterward"]],
      ["music", "The soundtrack", "What should everyone hear?", "Bowie. Bach. No hymns. All the hymns.", ["A song that must be played", "Music for arriving or leaving", "Anything I really do not want"]],
      ["details", "The details", "What would make it feel like you?", "Readings, flowers, food, dress, atmosphere and personal requests.", ["The mood I would like", "Readings, flowers or dress", "Food, drink or a personal touch"]],
    ],
  },
  {
    key: "importantStuff", title: "My important stuff", colour: "cream", kicker: "No one knows where anything is. Until now.",
    description: "A useful map of what exists, who provides it and where the paperwork lives.",
    fields: [
      ["insurance", "Insurance", "What insurance exists?", "Provider names, policy type and where the documents are kept—not passwords.", ["Life or health insurance", "Home, vehicle or other cover", "Where the policy documents are kept"]],
      ["property", "Property", "What should people know about property?", "Addresses, ownership context and where the relevant paperwork is.", ["Property I own or share", "Mortgage, landlord or agent", "Where deeds and paperwork are kept"]],
      ["money", "Money and pensions", "Which providers or advisers should people know about?", "Names and document locations only. Never add passwords, PINs or card details.", ["Banks and savings providers", "Pensions and investments", "Where statements or adviser details are kept"]],
      ["household", "Household", "Which bills, subscriptions or utilities matter?", "A practical list of providers and where account information is safely stored.", ["Energy, water and council tax", "Phone, internet and subscriptions", "Anything that should be cancelled quickly"]],
    ],
  },
  {
    key: "vault", title: "My vault", colour: "navy", kicker: "A calm place for the sensitive stuff.",
    description: "Record what important documents exist and where they can safely be found.",
    fields: [
      ["documents", "Important documents", "Which documents should people look for?", "Wills, policies, certificates or deeds—and where each is stored.", ["My will and legal documents", "Certificates, policies or deeds", "A list of what exists and where"]],
      ["storage", "Safe storage", "Where are physical documents kept?", "For example: the blue folder in the study. Do not add safe codes or PINs.", ["The room, drawer or folder", "Who else knows the location", "A safe place without recording its code"]],
      ["digitalAccess", "Digital access", "How should people find your digital emergency information?", "For example: My passwords are in 1Password; my partner knows how to access the emergency kit.", ["The password manager I use", "Who knows the emergency process", "Where digital instructions are stored"]],
      ["advisers", "Trusted advisers", "Who can help locate or explain things?", "Professional names and contact details, not login credentials.", ["Someone who knows the paperwork", "A solicitor, accountant or adviser", "How to contact them safely"]],
    ],
  },
];

export const pricing = [
  { name: "Annual", price: "£29", suffix: "/ year", description: "Keep your plan current, private and ready." },
  { name: "Lifetime", price: "£75", suffix: "once", description: "Pay once. Keep Good Grief for good." },
];

export const planSteps = productAreas.flatMap((area) => area.fields.map(([field, title, prompt, placeholder, starterPrompts]) => ({
  key: `${area.key}.${field}`, areaKey: area.key, field, areaTitle: area.title, title, prompt, placeholder, starterPrompts,
})));
