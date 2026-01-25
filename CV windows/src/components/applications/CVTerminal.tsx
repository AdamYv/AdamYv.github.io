import React, { useState, useEffect, useRef } from 'react';

export const CVTerminal: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const cvData = {
    name: "Votre Nom",
    title: "Développeur Full Stack",
    email: "votre.email@example.com",
    phone: "+33 1 23 45 67 89",
    location: "Paris, France",
    summary: "Développeur passionné avec 5+ années d'expérience en développement web moderne.",
    skills: [
      "JavaScript/TypeScript", "React", "Node.js", "Python", 
      "SQL/NoSQL", "Docker", "AWS", "Git"
    ],
    experience: [
      {
        company: "Tech Corp",
        position: "Développeur Senior",
        period: "2021 - Présent",
        description: "Développement d'applications web complexes avec React et Node.js"
      },
      {
        company: "StartUp Inc",
        position: "Développeur Full Stack",
        period: "2019 - 2021",
        description: "Création de solutions innovantes pour des clients variés"
      }
    ],
    education: [
      {
        school: "École d'Ingénieurs",
        degree: "Master en Informatique",
        period: "2017 - 2019"
      }
    ]
  };

  const commands = {
    help: () => [
      "Commandes disponibles:",
      "  help          - Affiche cette aide",
      "  whoami        - Informations personnelles",
      "  skills        - Compétences techniques",
      "  experience    - Expérience professionnelle",
      "  education     - Formation",
      "  contact       - Informations de contact",
      "  clear         - Efface l'écran",
      "  cv            - Affiche le CV complet",
      ""
    ],
    whoami: () => [
      `Nom: ${cvData.name}`,
      `Titre: ${cvData.title}`,
      `Localisation: ${cvData.location}`,
      "",
      cvData.summary,
      ""
    ],
    skills: () => [
      "Compétences techniques:",
      ...cvData.skills.map(skill => `  • ${skill}`),
      ""
    ],
    experience: () => [
      "Expérience professionnelle:",
      "",
      ...cvData.experience.flatMap(exp => [
        `${exp.position} - ${exp.company}`,
        `Période: ${exp.period}`,
        `Description: ${exp.description}`,
        ""
      ])
    ],
    education: () => [
      "Formation:",
      "",
      ...cvData.education.flatMap(edu => [
        `${edu.degree}`,
        `École: ${edu.school}`,
        `Période: ${edu.period}`,
        ""
      ])
    ],
    contact: () => [
      "Informations de contact:",
      `  Email: ${cvData.email}`,
      `  Téléphone: ${cvData.phone}`,
      `  Localisation: ${cvData.location}`,
      ""
    ],
    cv: () => [
      "=".repeat(50),
      `${cvData.name.toUpperCase()} - ${cvData.title.toUpperCase()}`,
      "=".repeat(50),
      "",
      "RÉSUMÉ:",
      cvData.summary,
      "",
      "CONTACT:",
      `  Email: ${cvData.email}`,
      `  Téléphone: ${cvData.phone}`,
      `  Localisation: ${cvData.location}`,
      "",
      "COMPÉTENCES:",
      ...cvData.skills.map(skill => `  • ${skill}`),
      "",
      "EXPÉRIENCE:",
      ...cvData.experience.flatMap(exp => [
        "",
        `${exp.position} - ${exp.company} (${exp.period})`,
        `${exp.description}`
      ]),
      "",
      "FORMATION:",
      ...cvData.education.flatMap(edu => [
        "",
        `${edu.degree} - ${edu.school} (${edu.period})`
      ]),
      "",
      "=".repeat(50),
      ""
    ],
    clear: () => {
      setOutput([]);
      return [];
    }
  };

  useEffect(() => {
    setOutput([
      "Terminal CV v1.0",
      "Tapez 'help' pour voir les commandes disponibles.",
      "Tapez 'cv' pour afficher le CV complet.",
      ""
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    setOutput(prev => [...prev, `$ ${command}`]);
    
    setIsExecuting(true);
    setTimeout(() => {
      if (cmd in commands) {
        const result = (commands as any)[cmd]();
        if (result) {
          setOutput(prev => [...prev, ...result]);
        }
      } else if (cmd === '') {
        // Empty command, do nothing
      } else {
        setOutput(prev => [...prev, `Commande non reconnue: ${command}`, "Tapez 'help' pour voir les commandes disponibles.", ""]);
      }
      setIsExecuting(false);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  return (
    <div className="terminal" ref={terminalRef}>
      {output.map((line, index) => (
        <div key={index} className="terminal-output">
          {line}
        </div>
      ))}
      <div className="flex items-center">
        <span className="terminal-prompt">$ </span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
          disabled={isExecuting}
          autoFocus
        />
        {isExecuting && <span className="ml-2 animate-pulse">...</span>}
      </div>
    </div>
  );
};