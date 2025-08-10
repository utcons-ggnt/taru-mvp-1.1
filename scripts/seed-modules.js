// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Video URLs for different subjects based on provided YouTube links
const magnetBrainsVideos = {
  geography: [
    {
      title: "Complete English Transcription and Translation of the Solar System & C…",
      description: "Learn fundamental geographical concepts, continents, countries, and maps",
      subject: "Geography",
      grade: "Class 6",
      difficulty: "beginner",
      duration: 45,
      videoUrl: "https://www.youtube.com/embed/Al9v3jxSW1I",
      transcribe: `Hello everyone! Special Vikrant Singh Rajput, welcome to Magnet Brains. In this video, we are starting a new chapter – yes, the Geography of Plastics, Chapter 10 – Our Solar System. This chapter is quite interesting; everyone is always curious about celestial bodies and all the wonders floating in space. In this chapter, we will get to know and understand all those things – what they look like, what they are. This video is basically the introduction to the chapter, where I will tell you what we’re going to study and how we’re going to start.

Let me ask you something: when we go out in the evening as it begins to get dark, have you noticed the sky at sunset? You can see the sun setting, and at the same time the moon rising. Sometimes in the morning, too, both sun and moon are visible. What happens as sunset passes and night draws in? The light slowly reduces, and as the sky gets darker, stars start to twinkle.

You’ll see many stars in the sky and the big moon. Where does the sun go? The sun doesn’t literally drown in the sea; it stays there, but the earth rotates, and that’s why it looks that way. Two things happen to the earth – it rotates (spins on its own axis) and revolves (moves around the sun). We’ll discuss the differences and details of these movements. The solar system includes the earth, other planets, moons, stars, asteroids, meteors, galaxies, and more. We’ll learn about all of this in the chapter and also some interesting facts.

You can easily download notes for this chapter on our official website magnetbrains.com, where all subjects and topics are arranged from Class 4 to Class 12. Enjoy learning!

---

What are celestial bodies? Celestial bodies are everything that we see in the universe – stars, planets, moons, asteroids, etc. At night, you can see bright stars and the moon. The appearance of the moon changes – sometimes you see the full moon, sometimes none at all, or just a part of it. These are the different phases of the moon (full moon and new moon, also called Purnima and Amavasya in Hindi).

Why do some stars appear bright, and others not so much? It’s all about distance. The sun appears very bright and hot because it’s the nearest star to us, while other stars are actually much bigger but appear as tiny dots because they’re so far away.

Now, about constellations. A group of stars forming a particular pattern is called a constellation. These patterns are often named after mythological figures, animals, objects, etc. The most easily identifiable constellation is the Great Bear (Ursa Major), called Saptarshi in Hindi. The pole star (Dhruv Tara) helps determine the North direction at night.

Some celestial bodies, like planets, don’t have their own light or heat; they reflect the sun’s light. The planets in our solar system – Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune – all revolve around the sun. Our earth is a planet, and its only natural satellite is the moon.

There are human-made satellites too, which are launched into space for communication, weather forecasting, and scientific studies, like INSAT and NAVIC.

Asteroids and meteors: Between Mars and Jupiter is the asteroid belt, made up of large rocky bodies. When smaller pieces called meteoroids enter the earth’s atmosphere, they burn up because of friction with the air and create what we call a “shooting star.” If some survive and hit earth, they are called meteorites.

Our solar system is a small part of a galaxy – the Milky Way, known as Akash Ganga in Hindi. A galaxy is a massive collection of stars, dust, and gas, and our universe consists of millions of galaxies.

Some interesting facts: Light travels at approximately 300,000 kilometers per second, yet it takes sun’s light about 8 minutes to reach earth. The first man to step on the moon was Neil Armstrong (July 20, 1969). India’s first astronaut was Rakesh Sharma. Earth is called the “Blue Planet” because 70% of its surface is water and appears blue from space.

The chapter ends with NCERT questions and answers, covering differences between stars and planets, why earth is unique, what’s a constellation, why we always see only one side of the moon, and what is the universe.

You can find detailed notes, exercises, and explanations for all topics on magnetbrains.com, covering all subjects and classes from 4 to 12 – free to download and study!`, // Add your transcription string here using template literals for multiline support
      quizQuestions: [
        {
          question: "What is geography?",
          options: [
            "The study of numbers and calculations",
            "The study of Earth's surface and its features",
            "The study of living organisms",
            "The study of chemical reactions"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["definition", "concepts"],
          explanation: "Geography is the study of Earth's surface, including its physical features, climate, and human activities."
        },
        {
          question: "How many continents are there on Earth?",
          options: ["5", "6", "7", "8"],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["continents", "counting"],
          explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia."
        },
        {
          question: "Which is the largest continent?",
          options: ["Africa", "Asia", "North America", "Europe"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["continents", "size-comparison"],
          explanation: "Asia is the largest continent, covering about 30% of Earth's land area."
        },
        {
          question: "What is a landform?",
          options: [
            "A type of weather pattern",
            "A natural feature of Earth's surface",
            "A type of plant",
            "A type of animal"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["landforms", "definition"],
          explanation: "A landform is a natural feature of Earth's surface, such as mountains, valleys, plains, or plateaus."
        },
        {
          question: "Which of these is NOT a type of landform?",
          options: ["Mountain", "River", "Desert", "Cloud"],
          correctAnswer: 3,
          difficulty: "medium",
          skillTags: ["landforms", "classification"],
          explanation: "Cloud is a weather phenomenon, not a landform. Mountains, rivers, and deserts are all landforms."
        },
        {
          question: "What is the purpose of a map?",
          options: [
            "To show only roads and cities",
            "To represent Earth's surface on a flat surface",
            "To show only political boundaries",
            "To display only natural features"
          ],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["maps", "purpose"],
          explanation: "A map is a representation of Earth's surface on a flat surface, showing various features like landforms, political boundaries, and human settlements."
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["geography", "continents", "landforms", "maps"]
    }
  ],
  science: [
    {
      title: "Comprehensive Overview of Nutrition in Plants - Class 7 Science",
      description: "Complete understanding of how plants make their own food through photosynthesis",
      subject: "Science",
      grade: "Class 7",
      difficulty: "beginner",
      duration: 50,
      videoUrl: "https://www.youtube.com/embed/oP2sbq9G5PI",
      transcribe: `Hello everyone, welcome to Make Any Difference. Today we will learn about Nutrition in Plants, a chapter from Class 7 Science. So, what is nutrition? We are all born and the food we eat gives us energy, which enables all our life processes. The process which supplies us with food and energy is known as nutrition.

Definition of Nutrition: Food enables living beings to carry out the basic activities of life - the life processes. The process by which organisms obtain food required for sustaining this is called nutrition. Nutrition is important for both plants and animals. This chapter focuses on Nutrition in Plants.

Primarily, there are two types of nutrition: autotrophic and heterotrophic. Autotrophic nutrition is when organisms make their own food, for example, green plants. Heterotrophic is when organisms depend on others for food. In this chapter, our focus is on autotrophic nutrition as we discuss nutrition in plants.

How do plants prepare their food? Plants take in carbon dioxide from air and water from soil. Water is absorbed through roots and reaches the leaves via stem. Carbon dioxide enters through tiny pores in leaves called stomata. Leaves also contain green pigment called chlorophyll. In the presence of chlorophyll and sunlight, green plants synthesize their own food – this process is called photosynthesis.

Photosynthesis: The process by which green plants make food (glucose) from carbon dioxide and water using sunlight and chlorophyll is called photosynthesis. The general chemical equation of photosynthesis is: Carbon dioxide (CO2) + Water (H2O) –(in sunlight & chlorophyll)→ Glucose (C6H12O6) + Oxygen (O2).

Experiment: Take a green plant and cover part of its leaf with black paper. Expose it to sunlight, later remove the covered part and test it with iodine solution. Part exposed to sunlight turns blue-black (indicating starch formation), while covered part doesn't – proving sunlight is essential for photosynthesis.

Modes of Nutrition in Plants: Not all plants can make their own food. Some, lacking chlorophyll, depend on others. Such plants are called parasitic plants (e.g., Cuscuta), which live on host plants and absorb nutrients from them. Another mode is insectivorous plants (e.g., pitcher plant), which trap insects for nutrition due to lack of certain nutrients in the soil.

A third mode is saprophytic nutrition, where organisms like fungi obtain nutrition from decaying organic matter (e.g., fungi on bread). Detailed diagrams often show this process.

Symbiosis: Some organisms, such as certain plants and fungi, coexist for mutual benefit. For instance, fungi help plant roots absorb minerals and water more efficiently, while plants provide food for the fungi. A well-known example of symbiosis is the relationship between legume roots and Rhizobium bacteria, which helps in nitrogen fixation and in-turn supports plant growth.

Replenishing Nutrients in Soil: Growing crops depletes soil nutrients, which can be replenished by adding fertilizers or through natural processes like nitrogen fixation by Rhizobium bacteria.

Frequently Asked Questions from the Chapter:
1. Differentiate between parasite and saprophyte: Parasites (e.g., Cuscuta) depend on host plants for food, whereas saprophytes (e.g., fungi) feed on decaying matter.
2. How do green plants store their food? As starch.
3. Which pigment helps in capturing solar energy? Chlorophyll, present in chloroplasts.
4. During photosynthesis, which gas is released? Oxygen.
5. Why is sunlight necessary for photosynthesis? Because it drives the food-making process in plants.

So, these are some highlights and important concepts from Nutrition in Plants, Class 7 Science. In the next video, we will cover more chapters. Thank you!`, // Add your transcription string here using template literals for multiline support
      quizQuestions: [
        {
          question: "What is the process by which plants make their own food?",
          options: [
            "Respiration",
            "Photosynthesis",
            "Digestion",
            "Excretion"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["photosynthesis", "definition"],
          explanation: "Photosynthesis is the process by which plants make their own food using sunlight, water, and carbon dioxide."
        },
        {
          question: "What are the raw materials needed for photosynthesis?",
          options: [
            "Sunlight, water, and oxygen",
            "Sunlight, water, and carbon dioxide",
            "Water, oxygen, and glucose",
            "Carbon dioxide, oxygen, and glucose"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["raw-materials", "photosynthesis"],
          explanation: "The raw materials for photosynthesis are sunlight, water, and carbon dioxide."
        },
        {
          question: "Which part of the plant is mainly responsible for photosynthesis?",
          options: ["Roots", "Stem", "Leaves", "Flowers"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["plant-parts", "photosynthesis"],
          explanation: "Leaves are the main site of photosynthesis because they contain chlorophyll and have a large surface area to capture sunlight."
        },
        {
          question: "What is the green pigment in plants called?",
          options: ["Hemoglobin", "Chlorophyll", "Melanin", "Carotene"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["chlorophyll", "pigments"],
          explanation: "Chlorophyll is the green pigment in plants that captures sunlight for photosynthesis."
        },
        {
          question: "What are plants that make their own food called?",
          options: ["Heterotrophs", "Autotrophs", "Parasites", "Saprophytes"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["autotrophs", "nutrition-types"],
          explanation: "Plants that make their own food are called autotrophs (auto = self, troph = nutrition)."
        },
        {
          question: "What is the main product of photosynthesis?",
          options: ["Oxygen", "Glucose", "Carbon dioxide", "Water"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["products", "photosynthesis"],
          explanation: "Glucose (sugar) is the main product of photosynthesis, which plants use as food and energy."
        }
      ],
      points: 18,
      prerequisites: [],
      tags: ["photosynthesis", "plant-nutrition", "autotrophs"]
    },
    {
      title: "Complete Overview and Analysis of Class 7 Science Chapter 1: Nutrition…",
      description: "Detailed explanation of plant nutrition with NCERT solutions and examples",
      subject: "Science",
      grade: "Class 7",
      difficulty: "intermediate",
      duration: 55,
      videoUrl: "https://www.youtube.com/embed/JbnxZR01HrY",
      transcribe: `Hello students! This is Dissolve Tiwari and you are watching your favorite educational channel, Magnet Brains. Here, we offer you 100% free, quality educational products—meaning all subject-related videos are available to you at no cost, and they are of high quality. You can watch our videos, and today, I'm going to teach and give you an overview of the Class 7th Science book, especially Chapter 1: Nutrition in Plants. I will explain what we will study, how we’ll proceed, and what our teaching pattern will be. We will do a deep study of the NCERT book for Class 7 Science.

First, I’ll give you a syllabus overview, telling you which chapters are important, which require more attention, and which are easier. All chapters are interesting and informative, providing new insights. My pattern is to comprehensively discuss each chapter, go through all topics and subtopics, and also include necessary topics not explicitly mentioned in the book but essential for understanding. We’ll start with Chapter 1: Nutrition in Plants and proceed through the chapters such as Nutrition in Animals, Fiber to Fabric, Heat, Acids Bases & Salts, Physical & Chemical Changes, Weather & Climate, Winds Storms & Cyclones, Soil, Respiration in Organisms, and so on, up to Wastewater Story (Chapter 18). Each chapter introduces new concepts essential for higher studies and real life.

We’ll first discuss the chapters, then activities, then solutions to exercises and examples, and finally, discuss possible exam questions. Quality learning is our aim!

-----------------------------

Chapter 1: Nutrition in Plants

Plants need nutrition just like animals for growth, fighting diseases, reproduction, and surviving adverse conditions. The three primary nutrients are:
- Phosphorus: Vital for seed germination and root development.
- Nitrogen: Essential for forming amino acids, which create proteins necessary for leaf and stem growth.
- Potassium: Important for flowers, fruits, disease resistance, water regulation, respiration, and photosynthesis.

Secondary nutrients include Calcium (for cell strength), Magnesium (for chlorophyll and healthy leaves), and Sulfur (for amino acid synthesis). Trace elements like Boron, Copper, Iron, Manganese, Zinc, etc., are also necessary.

Plants obtain nutrients in two ways (modes of nutrition):
1. Autotrophic: They prepare their own food from simple substances like water, carbon dioxide, and minerals using sunlight and chlorophyll. Plants are called autotrophs for this reason.
2. Heterotrophic: Some plants, like Amarbel (Cuscuta), cannot prepare their own food and depend on other plants—they are called parasites. Some trap insects (insectivorous plants like pitcher plants) for nutrition.

Photosynthesis is the process through which green plants make their food using sunlight, water, carbon dioxide, and minerals. Oxygen is released in this process. The leaf is the food factory of the plant. Water and minerals from the soil travel via roots and vessels to the leaves. Carbon dioxide enters through tiny pores called stomata on the leaf surface. Chlorophyll in the leaves captures solar energy, enabling photosynthesis. The general equation is:
   Carbon dioxide + Water --(Sunlight, Chlorophyll)--> Carbohydrate (Sugar) + Oxygen

Only green parts (due to the pigment chlorophyll) perform photosynthesis. Light is essential; this is verified in practical activities included in your textbook.

-----------------------------------

Other Modes of Nutrition
Some plants, like Cuscuta (Amarbel), are parasites—they lack chlorophyll and steal nutrition from host plants. Insectivorous plants like the pitcher plant trap insects and digest them to supplement poor soil nutrition, especially nitrogen. Saprotrophic nutrition is seen in fungi and bacteria—they draw nutrition from dead organic matter and are crucial decomposers, recycling nutrients into the soil.

-----------------------------------------------

Soil Nutrient Replenishment
Plants absorb nutrients from soil. After one crop, soil loses nutrients and needs replenishment via fertilizers or manure. Pulses like gram and beans have nodules containing rhizobium bacteria, which convert atmospheric nitrogen into usable forms for plants, reducing the need for external nitrogen fertilizers. Other minerals are restored to the soil by decomposers breaking down dead plants and animals.

-------------------------------------------

Activities:
- Test for starch (indicates photosynthesis in leaves).
- Demonstrating the necessity of sunlight for photosynthesis.
- Observing the growth and role of fungi (like mold on bread).

---------------------------------------------

NCERT Solutions/Tips:
- Food is essential for growth, energy, repair, and protection from diseases for all living organisms.
- Differences between parasitic and saprotrophic nutrition.
- Only green parts of plants perform photosynthesis.
- Solar energy is trapped by chlorophyll; oxygen is released during photosynthesis.
- Bacteria like Rhizobium in legume roots help restore soil nitrogen.

----------------------------------------------

Summary/Conclusion:
Chapter 1 covers how plants need and obtain nutrients, the role of photosynthesis, special cases like parasites and insectivorous plants, the importance of soil nutrients, and the role of decomposers and symbiotic bacteria. Understanding these concepts is crucial not only for exams but also for real-life applications and future studies. Videos for all activities and solution explanations are available free of cost on our website. Join us for more lessons, stay curious, and keep learning!`, // Add your transcription string here using template literals for multiline support
      quizQuestions: [
        {
          question: "Why are plants called producers in the food chain?",
          options: [
            "Because they produce oxygen",
            "Because they produce their own food",
            "Because they produce seeds",
            "Because they produce flowers"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["producers", "food-chain"],
          explanation: "Plants are called producers because they produce their own food through photosynthesis, which other organisms depend on."
        },
        {
          question: "What happens to the glucose produced during photosynthesis?",
          options: [
            "It is immediately released into the air",
            "It is stored as starch or used for energy",
            "It is converted to carbon dioxide",
            "It is excreted by the plant"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["glucose-utilization", "energy"],
          explanation: "The glucose produced during photosynthesis is either stored as starch or used by the plant for energy and growth."
        },
        {
          question: "Which of these is NOT a condition required for photosynthesis?",
          options: ["Sunlight", "Chlorophyll", "Oxygen", "Carbon dioxide"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["conditions", "photosynthesis"],
          explanation: "Oxygen is a product of photosynthesis, not a requirement. Sunlight, chlorophyll, and carbon dioxide are required."
        },
        {
          question: "What is the role of stomata in photosynthesis?",
          options: [
            "To absorb sunlight",
            "To take in carbon dioxide and release oxygen",
            "To transport water",
            "To store food"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["stomata", "gas-exchange"],
          explanation: "Stomata are tiny pores in leaves that allow carbon dioxide to enter and oxygen to exit during photosynthesis."
        },
        {
          question: "How do plants get water for photosynthesis?",
          options: [
            "Through their leaves",
            "Through their roots",
            "Through their flowers",
            "Through their stem only"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["water-absorption", "roots"],
          explanation: "Plants absorb water through their roots, which is then transported to the leaves for photosynthesis."
        },
        {
          question: "What is the chemical equation for photosynthesis?",
          options: [
            "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
            "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
            "6CO₂ + 6O₂ → C₆H₁₂O₆ + 6H₂O",
            "C₆H₁₂O₆ + 6H₂O → 6CO₂ + 6O₂"
          ],
          correctAnswer: 0,
          difficulty: "hard",
          skillTags: ["chemical-equation", "photosynthesis"],
          explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ represents the conversion of carbon dioxide and water to glucose and oxygen in the presence of sunlight and chlorophyll."
        }
      ],
      points: 20,
      prerequisites: ["Nutrition in Plants - Full Chapter"],
      tags: ["photosynthesis", "food-chain", "stomata", "chemical-equation"]
    }
  ],
  mathematics: [
    {
      title: "Introduction to Integers: Class 7 Maths Chapter Overview & Basics",
      description: "Complete introduction to integers, positive and negative numbers, and their operations",
      subject: "Mathematics",
      grade: "Class 7",
      difficulty: "beginner",
      duration: 40,
      videoUrl: "https://www.youtube.com/embed/qOfN5jA8eMc",
      transcribe: `Hello students, welcome to Magnet Brains! How are you all? I hope you're doing well. Before starting the video, let me tell you that Magnet Brains provides free quality education from Kindergarten to Class 12. Yes, you heard it right! Complete education is provided free of cost from class K to class 12. What do you need to do? Even for different state boards like CBSE, UP Board, MP Board, and Bihar Board, Magnet Brains provides education free of cost, along with free e-books and e-notes—links are in the description box. So, quickly subscribe to the Magnet Brains channel.

Today, we’re going to look at the first chapter of our Class 7 syllabus, which is "Integers." In this video, I’ll give you a chapter overview—what all we will study in this chapter—and then we’ll move to the introduction. In the introduction, we will cover what integers are and some related terms like whole numbers and natural numbers, their definitions, etc. Let’s start the video!

First, as I mentioned, we'll cover the Introduction section—what are integers, negative integers, positive integers, and related basic terms and their definitions. Next, we have Properties of Addition of Integers—the properties used for integers in addition, as well as the Properties of Subtraction of Integers. These two are interrelated—the properties used in addition are also used in subtraction, which will be explained as we proceed. Then, we have Multiplication of Integers, Properties of Multiplication of Integers, and Division of Integers—when we divide integers, do we get an integer as the answer or something else? Properties of Division of Integers—almost the same as addition, subtraction, multiplication, and division, so don't get confused, we'll cover the topics step by step.

Now, moving on to the types of numbers—first, natural numbers. Counting numbers are called natural numbers, like 1, 2, 3, 4, 5, and so on, because we can count these numbers. Next, whole numbers—all natural numbers together with zero are called whole numbers. Zero is not a natural number but it is a whole number, so 0, 1, 2, 3, 4, etc., are whole numbers. Every natural number is a whole number, but zero is a whole number and not a natural number.

Next, what are integers? All natural numbers, zero, and negatives of counting numbers are called integers, i.e., ..., -3, -2, -1, 0, 1, 2, 3, ... Positive integers are 1, 2, 3, 4, etc.; negative integers are -1, -2, -3, -4, etc.; and zero is an integer that is neither positive nor negative.

Some basic rules for signs in addition and subtraction: plus and minus is minus, minus and plus is also minus, minus and minus is plus, and plus and plus remains plus. For example, -3 + 2 (negative and positive) is the same as minus sign; so 3 - 2 is 1. Since 3 is larger and has the negative sign, the answer is -1. Another example: -5 - 4, both are negatives, so we add (as minus and minus is plus), but the answer is negative (-9), because the higher value is negative. Positive and positive, like 3 + 2, add up to 5.

Regarding BODMAS: B for Bracket, O for Of, D for Divide, M for Multiply, A for Add, S for Subtract—solve in this order, starting with the bracket. For a sum like 11 + (-3), once you open the bracket using rules, it becomes 11 - 3 = 8. The higher value is positive, so the answer is positive.

Now, representation of integers on a number line: A straight line (use a scale in your notebook). Start from zero. The right side shows positive integers (1, 2, 3, ...), the left side negative integers (-1, -2, -3, ...), and zero in the center. For questions like -3 + 5, solve as 5 - 3 = 2, so locate 2 on the right side of zero. For 2 - 7, solve as -5, so from 2, move left 7 spaces to -5. Addition moves you right, subtraction moves you left on the number line.

That’s all for the basic rules and number line representation. For more explanation and free access to e-books and e-notes, check the description for links. Stay tuned for more videos and social media links!`, // Add your transcription string here using template literals for multiline support
      quizQuestions: [
        {
          question: "What are integers?",
          options: [
            "Only positive numbers",
            "Only negative numbers",
            "Positive numbers, negative numbers, and zero",
            "Only decimal numbers"
          ],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["definition", "integers"],
          explanation: "Integers include positive numbers, negative numbers, and zero. They are whole numbers without fractions or decimals."
        },
        {
          question: "Which of these is an integer?",
          options: ["3.5", "-2", "1/2", "0.75"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["identification", "integers"],
          explanation: "-2 is an integer. 3.5, 1/2, and 0.75 are not integers because they have decimal or fractional parts."
        },
        {
          question: "What is the opposite of 7?",
          options: ["-7", "7", "0", "1/7"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["opposites", "negative-numbers"],
          explanation: "The opposite of 7 is -7. Opposite numbers are the same distance from zero but on opposite sides of the number line."
        },
        {
          question: "What is the sum of -5 and 3?",
          options: ["-8", "-2", "2", "8"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["addition", "integers"],
          explanation: "-5 + 3 = -2. When adding integers with different signs, subtract the smaller absolute value from the larger one and keep the sign of the larger absolute value."
        },
        {
          question: "What is the product of -4 and -6?",
          options: ["-24", "24", "-10", "10"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["multiplication", "integers"],
          explanation: "-4 × -6 = 24. When multiplying two negative numbers, the result is positive."
        },
        {
          question: "What is the absolute value of -8?",
          options: ["-8", "8", "0", "-1/8"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["absolute-value", "integers"],
          explanation: "The absolute value of -8 is 8. Absolute value represents the distance of a number from zero on the number line, which is always positive."
        }
      ],
      points: 18,
      prerequisites: [],
      tags: ["integers", "positive-numbers", "negative-numbers", "absolute-value"]
    }
  ]
};

// Import the Module model
let Module;
try {
  Module = require('../models/Module.ts').default;
} catch (error) {
  console.log('Trying alternative import method...');
  Module = require('../models/Module.ts');
}

async function seedModules() {
  try {
    console.log('Starting module seeding...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing modules
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    // Flatten all modules from different subjects
    const allModules = [];
    Object.keys(magnetBrainsVideos).forEach(subject => {
      allModules.push(...magnetBrainsVideos[subject]);
    });

         // Add additional fields and ensure schema compliance
     const modulesToInsert = allModules.map((module, index) => {
       const transID = `TRANSCRIBE_${String(index + 1).padStart(3, '0')}`; // Use transcribe IDs starting from 001
       console.log(`Generating transID for "${module.title}": ${transID}`);
       
       return {
         ...module,
         uniqueID: transID, // Keep uniqueID for schema compliance
         transID: transID,  // Add transID as requested
         learningType: 'hybrid',
       contentTypes: {
         video: {
           url: module.videoUrl,
           duration: module.duration,
           engagementThreshold: 80
         }
       },
       adaptiveFeatures: {
         difficultyAdjustment: true,
         personalizedPath: true,
         skillGaps: [],
         prerequisites: module.prerequisites || [],
         nextModules: []
       },
       gamification: {
         quests: generateQuests(module.subject),
         badges: generateAchievements(module.difficulty),
         leaderboard: true,
         streaks: true
       },
       aiFeatures: {
         realTimeAssessment: true,
         personalizedFeedback: true,
         adaptiveQuestions: true,
         learningPathRecommendation: true
       },
       isActive: true,
       createdAt: new Date(),
       updatedAt: new Date()
     };
   });

    // Insert modules
    await Module.insertMany(modulesToInsert);
    console.log(`Successfully seeded ${modulesToInsert.length} modules`);

    // Display summary
    const subjectCounts = {};
    modulesToInsert.forEach(module => {
      subjectCounts[module.subject] = (subjectCounts[module.subject] || 0) + 1;
    });

    console.log('\n=== MODULE SEEDING SUMMARY ===');
    console.log('\nModules by subject:');
    Object.entries(subjectCounts).forEach(([subject, count]) => {
      const subjectModules = modulesToInsert.filter(m => m.subject === subject);
      console.log(`${subject}: ${subjectModules.map(m => m.title).join(', ')}`);
    });

         console.log('\n=== GENERATED TRANS IDs ===');
     modulesToInsert.forEach(module => {
       console.log(`${module.transID}: ${module.title} (${module.subject})`);
     });
     console.log('=============================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
}

function getSubjectIcon(subject) {
  const icons = {
    'Mathematics': '🔢',
    'Science': '🔬',
    'Geography': '🌍'
  };
  return icons[subject] || '📖';
}

function generateQuests(subject) {
  const baseQuests = [
    { 
      id: 'watch_video',
      title: 'Video Watcher', 
      description: 'Complete the video lesson', 
      type: 'watch',
      target: 1, 
      reward: 10 
    },
    { 
      id: 'quiz_master',
      title: 'Quiz Master', 
      description: 'Score 80% or higher in quiz', 
      type: 'score',
      target: 80, 
      reward: 15 
    },
    { 
      id: 'fast_learner',
      title: 'Fast Learner', 
      description: 'Complete module in under 30 minutes', 
      type: 'complete',
      target: 30, 
      reward: 20 
    }
  ];
  
  // Add subject-specific quests
  const subjectQuests = {
    'Mathematics': { 
      id: 'problem_solver',
      title: 'Problem Solver', 
      description: 'Solve all math problems correctly', 
      type: 'complete',
      target: 100, 
      reward: 25 
    },
    'Science': { 
      id: 'experiment_explorer',
      title: 'Experiment Explorer', 
      description: 'Identify all scientific concepts', 
      type: 'complete',
      target: 100, 
      reward: 25 
    },
    'Geography': { 
      id: 'world_explorer',
      title: 'World Explorer', 
      description: 'Master all geographical concepts', 
      type: 'complete',
      target: 100, 
      reward: 25 
    }
  };
  
  if (subjectQuests[subject]) {
    baseQuests.push(subjectQuests[subject]);
  }
  
  return baseQuests;
}

function generateAchievements(difficulty) {
  const baseAchievements = ['First Steps', 'Consistent Learner'];
  
  if (difficulty === 'intermediate') {
    baseAchievements.push('Rising Star');
  } else if (difficulty === 'advanced') {
    baseAchievements.push('Expert Level');
  }
  
  return baseAchievements;
}

// Run the script
if (require.main === module) {
  seedModules()
    .then(() => {
      console.log('\n✅ Modules seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Module seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedModules };