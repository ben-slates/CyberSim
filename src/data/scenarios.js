const buildStage = (stage) => stage;

export const scenarios = [
  {
    id: "operation-spear",
    title: "Operation Spear",
    category: "Phishing",
    difficulty: "Intermediate",
    timeLimit: 600,
    maxScore: 1000,
    description: "A high-trust spear-phishing campaign targets the CFO during quarter close.",
    briefing:
      "A lookalike executive request hit finance minutes before a treasury wire deadline. You are the incident commander for the security desk.",
    backgroundStory:
      "The company is closing a strategic acquisition. Attackers have scraped executive travel details and are impersonating the CEO to push an urgent international wire through the CFO's assistant.",
    hints: [
      "Executive urgency plus wire instructions should trigger out-of-band verification.",
      "Mail header anomalies matter more than polished wording in spear-phishing.",
      "Contain both the mailbox and the financial workflow to reduce blast radius."
    ],
    stages: [
      buildStage({
        id: "spear-stage-1",
        type: "email",
        title: "Urgent Wire Authorization",
        content:
          "The CFO forwards an email allegedly from the CEO asking for a confidential $480,000 transfer to a new legal escrow partner. The sender display name is correct, but the return-path domain ends in `-holdings.co` instead of the normal corporate domain.",
        systemLogs: [
          "[08:14:11] SECMAIL: SPF softfail for ceo@northstar-holdings.co",
          "[08:14:13] FINOPS: Treasury transfer request queued by CFO assistant",
          "[08:14:18] M365: Message flagged by user, confidence medium"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "spear-s1-c1",
            label: "Call the CFO and require voice verification with the CEO before any transfer.",
            description: "Freeze the payment and verify through an out-of-band channel.",
            icon: "PhoneCall",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Wire Paused",
              description: "Finance stops the wire and confirms the CEO never sent the request.",
              scoreChange: 220,
              timeBonus: 20,
              consequences: [
                "Fraudulent transfer prevented before bank submission.",
                "Executive assistant workflow is temporarily delayed but controlled."
              ],
              nextStage: "spear-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 25, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "spear-s1-c2",
            label: "Let finance proceed while you quietly inspect the email gateway logs.",
            description: "Avoid causing friction until you have more certainty.",
            icon: "Search",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Delay Opens Risk",
              description: "The bank receives the transfer draft while you are still investigating.",
              scoreChange: 40,
              timeBonus: -40,
              consequences: [
                "Finance assumes the message is legitimate because there is no immediate stop order.",
                "Your team now has to unwind a pending payment."
              ],
              nextStage: "spear-stage-2",
              threatLevelChange: 1,
              skillXP: { phishing: 8, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "spear-s1-c3",
            label: "Mark the message as spam and close the ticket as a false positive.",
            description: "Assume the secure email filter already handled it.",
            icon: "ShieldX",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Business Email Compromise Advances",
              description: "The wire is pushed through because security provides no objection.",
              scoreChange: -180,
              timeBonus: -30,
              consequences: [
                "Treasury operations gain false confidence.",
                "The fraud team must now treat this as a live financial incident."
              ],
              nextStage: "spear-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }),
      buildStage({
        id: "spear-stage-2",
        type: "investigation",
        title: "Mailbox Exposure Check",
        content:
          "Header review shows the message bypassed the allowlist using a recently registered domain and embedded a fake DocuSign link. The CFO admits she clicked the link from mobile but closed the page when it looked odd.",
        systemLogs: [
          "[08:18:01] PROXY: outbound HTTPS to docusign-review-secure.co/login",
          "[08:18:10] IDP: failed login for cfo@company.local from AS4134",
          "[08:18:12] MDM: iPhone Safari session observed, MFA prompt denied"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "spear-s2-c1",
            label: "Reset CFO credentials, revoke sessions, and search for related messages tenant-wide.",
            description: "Treat it as credential phishing with potential compromise.",
            icon: "KeyRound",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Credential Exposure Contained",
              description: "Active sessions are killed before the attacker can use the harvested password.",
              scoreChange: 240,
              timeBonus: 10,
              consequences: [
                "Mailbox access tokens are invalidated.",
                "Related phishing messages are found in two more executive inboxes."
              ],
              nextStage: "spear-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 30, malware: 0, intrusion: 12, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "spear-s2-c2",
            label: "Only block the phishing domain on the secure web gateway.",
            description: "Take a narrow infrastructure action and wait for further evidence.",
            icon: "GlobeLock",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Sessions Stay Alive",
              description: "Future clicks are blocked, but any captured credentials remain usable.",
              scoreChange: 70,
              timeBonus: 0,
              consequences: [
                "Attacker still has an opportunity to replay the password elsewhere.",
                "You reduce additional clicks but not identity risk."
              ],
              nextStage: "spear-stage-3",
              threatLevelChange: 0,
              skillXP: { phishing: 12, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 6 }
            }
          },
          {
            id: "spear-s2-c3",
            label: "Ask the CFO to watch for suspicious prompts and keep working.",
            description: "Minimize disruption during quarter close.",
            icon: "Clock3",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Identity Window Remains Open",
              description: "An attacker session appears in the tenant using legacy auth minutes later.",
              scoreChange: -120,
              timeBonus: -20,
              consequences: [
                "The account remains vulnerable to mailbox rule creation.",
                "Incident scope expands into identity monitoring."
              ],
              nextStage: "spear-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 2, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }),
      buildStage({
        id: "spear-stage-3",
        type: "containment",
        title: "Mailbox Rules Detected",
        content:
          "Your search uncovers a hidden inbox rule in the CFO mailbox forwarding messages containing `invoice`, `wire`, and `urgent` to an external ProtonMail address. The rule was created 6 minutes after the mobile click.",
        systemLogs: [
          "[08:22:41] M365 AUDIT: New-InboxRule 'archive_finance' by CFO account",
          "[08:22:42] M365 AUDIT: ForwardTo finance-escrow@proton.me",
          "[08:22:45] SOC: Two additional finance users received same lure"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "spear-s3-c1",
            label: "Remove the rule, isolate affected mailboxes, and initiate incident communications to finance leadership.",
            description: "Contain the compromise and align the business quickly.",
            icon: "Siren",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Forwarding Stopped",
              description: "Exfiltration is halted and finance leadership shifts to verified communication channels.",
              scoreChange: 260,
              timeBonus: 10,
              consequences: [
                "Potential sensitive deal communications stop leaving the tenant.",
                "Finance leadership is aligned on manual verification."
              ],
              nextStage: "spear-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 28, malware: 0, intrusion: 18, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "spear-s3-c2",
            label: "Capture screenshots for forensics before making any changes.",
            description: "Preserve evidence before containment.",
            icon: "Camera",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Evidence Preserved, Leakage Continues",
              description: "You keep clean screenshots, but more sensitive messages forward during the delay.",
              scoreChange: 60,
              timeBonus: -35,
              consequences: [
                "Forensic clarity improves.",
                "Additional negotiation details are sent externally."
              ],
              nextStage: "spear-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 15, malware: 0, intrusion: 10, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "spear-s3-c3",
            label: "Do nothing until legal approves mailbox intervention.",
            description: "Wait for procedural approval before containment.",
            icon: "FileWarning",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Fraud Escalates",
              description: "Attackers use the mailbox visibility to refine a second payment request to AP.",
              scoreChange: -150,
              timeBonus: -25,
              consequences: [
                "Sensitive finance context is lost to the attacker.",
                "The incident broadens from spear-phishing to business disruption."
              ],
              nextStage: "spear-stage-4",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }),
      buildStage({
        id: "spear-stage-4",
        type: "eradication",
        title: "Executive Response",
        content:
          "The board chair is asking whether the transaction data was exposed and whether the bank needs a fraud hold. You must choose the final response package before the situation moves from attempted compromise to reportable event.",
        systemLogs: [
          "[08:31:05] BANK FRAUD DESK: wire release awaiting secondary confirmation",
          "[08:31:18] LEGAL: asks for impact statement within 15 minutes",
          "[08:31:26] SOC: No further malicious sign-ins after forced revocation"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "spear-s4-c1",
            label: "Issue fraud hold with the bank, brief legal and executives, and launch tenant-wide phishing hunt.",
            description: "Close operational, legal, and technical loops together.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Attempt Neutralized",
              description: "The wire is canceled, exposure is bounded, and executives receive a defensible impact summary.",
              scoreChange: 180,
              timeBonus: 15,
              consequences: [
                "Bank confirms no funds left the account.",
                "Security rolls out controls against the same lure across the tenant."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 20, malware: 0, intrusion: 10, insider: 0, breach: 10, network: 0 }
            }
          },
          {
            id: "spear-s4-c2",
            label: "Contain technically but avoid a bank notification unless finance requests it.",
            description: "Keep the response scoped to IT operations.",
            icon: "Shield",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Partial Recovery",
              description: "No more phishing activity lands, but finance loses confidence because external coordination lags.",
              scoreChange: 70,
              timeBonus: 0,
              consequences: [
                "The organization recovers, but executive trust takes a hit.",
                "Follow-up audits question the absence of early fraud escalation."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 10, malware: 0, intrusion: 4, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "spear-s4-c3",
            label: "Close the incident after deleting the phishing email and note no confirmed compromise.",
            description: "Assume the main risk ended with message removal.",
            icon: "ArchiveX",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Residual Exposure Missed",
              description: "The hidden forwarding rule remains in a secondary mailbox and deal chatter continues leaking.",
              scoreChange: -200,
              timeBonus: -10,
              consequences: [
                "The organization later discovers quiet exposure of acquisition documents.",
                "A near miss becomes a material incident."
              ],
              nextStage: "end_failure",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      })
    ],
    endStates: {
      success: {
        title: "Phish Burned Out",
        description: "You prevented fraudulent payment, closed credential abuse, and synchronized technical and business response."
      },
      failure: {
        title: "Executive Fraud Lands",
        description: "Delayed containment let attackers leverage trust, mailbox access, and finance pressure into damaging exposure."
      },
      partial: {
        title: "Containment with Friction",
        description: "The attack was slowed and mostly contained, but external coordination or evidence handling lagged behind."
      }
    },
    learningObjectives: [
      "Verify executive payment requests out-of-band.",
      "Treat likely credential phishing as identity compromise until disproven.",
      "Coordinate finance, legal, and security when BEC touches payment workflows."
    ],
    realWorldContext:
      "Spear-phishing and business email compromise frequently exploit urgency, executive authority, and financial deadlines instead of malware.",
    references: [
      "NIST SP 800-61 Rev. 2 Incident Handling Guidance",
      "CISA Business Email Compromise Prevention Recommendations"
    ]
  },
  {
    id: "ransomstrike",
    title: "RansomStrike",
    category: "Malware",
    difficulty: "Advanced",
    timeLimit: 540,
    maxScore: 1000,
    description: "A finance laptop starts encrypting shared drives after a malicious macro execution.",
    briefing: "A user in finance reports inaccessible files and rapid file-renaming across the accounting share.",
    backgroundStory:
      "Quarter-end invoices are being processed from a workbook received by a trusted supplier contact. The machine is VPN-connected to HQ and mapped to multiple finance shares.",
    hints: [
      "Ransomware containment beats evidence perfection in the first minutes.",
      "Think laterally about mapped shares, credentials, and backup tampering.",
      "Stopping spread may require identity containment, not just endpoint isolation."
    ],
    stages: [
      {
        id: "ransom-stage-1",
        type: "endpoint",
        title: "Encryption Underway",
        content:
          "The finance laptop shows a black ransom note window while files on `\\\\acct-fs-02\\payables` are being renamed with `.blackkite` extensions. Help desk confirms CPU spikes and process creation from `EXCEL.EXE -> powershell.exe`.",
        systemLogs: [
          "[11:02:14] EDR: suspicious child process powershell.exe spawned by EXCEL.EXE",
          "[11:02:19] FILESRV: 412 file rename operations from FIN-LT-442",
          "[11:02:25] USER: reports 'all invoices are unreadable'"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "ransom-s1-c1",
            label: "Isolate the laptop from network immediately and disable the user's account.",
            description: "Contain host and identity at the same time.",
            icon: "LaptopMinimalCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Spread Interrupted",
              description: "Share encryption slows as SMB sessions are severed and the user token is disabled.",
              scoreChange: 230,
              timeBonus: 15,
              consequences: [
                "Primary infected endpoint loses access to finance shares.",
                "Potential credential reuse is cut off before further lateral movement."
              ],
              nextStage: "ransom-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 30, intrusion: 15, insider: 0, breach: 0, network: 8 }
            }
          },
          {
            id: "ransom-s1-c2",
            label: "Ask the user to power off the laptop and wait for IT.",
            description: "Rely on the user for containment.",
            icon: "Power",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Host Stops, Access Persists",
              description: "Encryption on the laptop ends, but the user's credentials remain active on cached sessions.",
              scoreChange: 100,
              timeBonus: -10,
              consequences: [
                "Containment depends on how quickly the user acts.",
                "You lose some memory evidence while leaving identity risk open."
              ],
              nextStage: "ransom-stage-2",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 12, intrusion: 0, insider: 0, breach: 0, network: 3 }
            }
          },
          {
            id: "ransom-s1-c3",
            label: "Collect a full forensic image before disconnecting anything.",
            description: "Prioritize evidence over containment.",
            icon: "HardDriveDownload",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Containment Delayed",
              description: "Encryption continues across departmental shares while imaging begins.",
              scoreChange: -170,
              timeBonus: -35,
              consequences: [
                "Business impact expands rapidly.",
                "Backup windows and recovery point objectives are threatened."
              ],
              nextStage: "ransom-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 5, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "ransom-stage-2",
        type: "spread",
        title: "Signs of Lateral Movement",
        content:
          "EDR shows failed service creation attempts on two file servers and a successful login to a backup management console using the same finance account. The ransomware note references stolen procurement records.",
        systemLogs: [
          "[11:05:02] BACKUP-MGR: interactive login by FIN\\amorris",
          "[11:05:07] WINLOGON: Event 4625 on FS-03 for service account creation attempt",
          "[11:05:12] DLP: 812MB outbound transfer to MEGA blocked"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "ransom-s2-c1",
            label: "Disable backup console access, rotate exposed credentials, and lock down SMB to critical shares.",
            description: "Protect recovery paths while stopping spread.",
            icon: "ShieldBan",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Recovery Path Secured",
              description: "Backups are preserved and the attacker loses easy access to shared storage.",
              scoreChange: 250,
              timeBonus: 10,
              consequences: [
                "Backup deletion attempts fail.",
                "Critical shares are segmented from routine user access."
              ],
              nextStage: "ransom-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 26, intrusion: 16, insider: 0, breach: 8, network: 12 }
            }
          },
          {
            id: "ransom-s2-c2",
            label: "Restore the finance share from backup immediately to reassure the business.",
            description: "Focus on service restoration before deeper containment.",
            icon: "RotateCcw",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Recovery Starts Too Early",
              description: "Restored files begin getting encrypted again because containment is incomplete.",
              scoreChange: -80,
              timeBonus: -20,
              consequences: [
                "Recovery effort has to be repeated.",
                "Business frustration increases as restored files relock."
              ],
              nextStage: "ransom-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 8, intrusion: 0, insider: 0, breach: 0, network: 2 }
            }
          },
          {
            id: "ransom-s2-c3",
            label: "Negotiate with the threat actor using the note contact channel.",
            description: "Attempt to slow activity through dialogue.",
            icon: "MessageSquareWarning",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Attacker Gains Time",
              description: "The actor senses pressure and accelerates additional extortion steps.",
              scoreChange: -160,
              timeBonus: -15,
              consequences: [
                "Negotiation yields no useful key or pause.",
                "Crisis leadership questions the lack of technical containment."
              ],
              nextStage: "ransom-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "ransom-stage-3",
        type: "impact",
        title: "Public Exposure Threat",
        content:
          "The CFO wants to know whether to shut down all finance operations. Legal asks if stolen procurement records make this a data breach. Meanwhile, an accounting workstation begins beaconing to the same command-and-control IP.",
        systemLogs: [
          "[11:10:41] EDR: second beacon observed from FIN-WS-118",
          "[11:10:44] DNS: lookup to api.blackkitecloud.top",
          "[11:10:52] LEGAL: requests exfiltration confidence assessment"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "ransom-s3-c1",
            label: "Expand containment to the finance subnet, preserve evidence, and classify as probable breach plus malware incident.",
            description: "Contain, communicate, and set the right incident posture.",
            icon: "Siren",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Clear Incident Posture",
              description: "Finance operations move to manual fallback while security prevents additional workstation infections.",
              scoreChange: 220,
              timeBonus: 5,
              consequences: [
                "Leadership has a clear status and fallback path.",
                "Potential exfiltration is tracked from the start of response."
              ],
              nextStage: "ransom-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 24, intrusion: 12, insider: 0, breach: 14, network: 10 }
            }
          },
          {
            id: "ransom-s3-c2",
            label: "Limit response to the original laptop and reassure finance that the issue is local.",
            description: "Keep business disruption low.",
            icon: "CircleDashed",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "False Locality Assumption",
              description: "The second infected workstation continues beaconing and staging file theft.",
              scoreChange: -110,
              timeBonus: -10,
              consequences: [
                "Incident scope expands silently.",
                "Leadership loses trust once the second host is confirmed."
              ],
              nextStage: "ransom-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 4, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "ransom-s3-c3",
            label: "Reconnect the first laptop on a quarantined VLAN and watch attacker behavior.",
            description: "Use the host as a controlled observation point.",
            icon: "Radar",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Intelligence Improves",
              description: "You observe the malware workflow, but risk tolerance tightens as leadership sees delays in recovery.",
              scoreChange: 70,
              timeBonus: -25,
              consequences: [
                "Threat intel value increases.",
                "Recovery remains paused longer than the business wants."
              ],
              nextStage: "ransom-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 16, intrusion: 8, insider: 0, breach: 4, network: 5 }
            }
          }
        ]
      },
      {
        id: "ransom-stage-4",
        type: "recovery",
        title: "Business Restoration Decision",
        content:
          "Backups are intact from 03:00. Finance can tolerate six hours of manual processing. The CEO asks whether to rebuild affected machines, restore data, and notify impacted suppliers today.",
        systemLogs: [
          "[11:18:09] BACKUP-MGR: immutable snapshot available 03:00 UTC",
          "[11:18:12] FINANCE: manual invoice workflow activated",
          "[11:18:15] SOC: no new beacons after subnet containment"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "ransom-s4-c1",
            label: "Rebuild compromised endpoints from gold image, restore clean shares, and launch breach notification assessment.",
            description: "Use disciplined recovery with parallel legal review.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Ransomware Stopped",
              description: "Recovery proceeds from known-good backups and the organization keeps evidence for legal and insurance requirements.",
              scoreChange: 170,
              timeBonus: 15,
              consequences: [
                "Operations resume from clean systems.",
                "The organization is positioned for breach disclosure decisions."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 24, intrusion: 8, insider: 0, breach: 12, network: 8 }
            }
          },
          {
            id: "ransom-s4-c2",
            label: "Restore data but leave machines in place after running antivirus.",
            description: "Choose the fastest route back to service.",
            icon: "Zap",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Residual Risk Persists",
              description: "Service returns, but confidence remains low because persistence was never fully ruled out.",
              scoreChange: 40,
              timeBonus: 10,
              consequences: [
                "Business is relieved by speed.",
                "Security carries elevated risk of reinfection."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 8, intrusion: 0, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "ransom-s4-c3",
            label: "Pay the ransom to reduce recovery time.",
            description: "Trade money for hoped-for speed.",
            icon: "BadgeDollarSign",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Bad Incentive, Weak Outcome",
              description: "A decryptor is provided late and does not fully restore affected archives, while extortion risk remains.",
              scoreChange: -190,
              timeBonus: -20,
              consequences: [
                "The organization pays without guaranteed full recovery.",
                "Threat actors mark the company as a viable payer."
              ],
              nextStage: "end_failure",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Containment Beats Encryption",
        description: "You cut off spread, protected backups, and restored from a clean footing without letting the actor dictate terms."
      },
      failure: {
        title: "Ransomware Owns the Tempo",
        description: "Delayed containment and weak recovery choices let the actor keep operational leverage."
      },
      partial: {
        title: "Service Restored with Residual Risk",
        description: "The business resumed work, but containment discipline or rebuild rigor fell short."
      }
    },
    learningObjectives: [
      "Contain host, credentials, and recovery infrastructure together.",
      "Do not start restoration before spread is under control.",
      "Ransomware response often overlaps with breach response due to extortion and exfiltration."
    ],
    realWorldContext:
      "Modern ransomware crews commonly pair encryption with data theft and target backup infrastructure early to pressure recovery decisions.",
    references: [
      "CISA StopRansomware Guide",
      "NCSC Ransomware Guidance for Incident Management"
    ]
  },
  {
    id: "ghost-login",
    title: "Ghost Login",
    category: "Intrusion",
    difficulty: "Intermediate",
    timeLimit: 480,
    maxScore: 1000,
    description: "An administrator appears to authenticate from Germany and Singapore within four minutes.",
    briefing: "Identity analytics triggered an impossible-travel alert on a privileged cloud admin account.",
    backgroundStory:
      "Your environment uses federated SSO with conditional access, but legacy VPN and service administration paths still exist. The account belongs to a senior IAM engineer on paid leave.",
    hints: [
      "Privileged impossible travel deserves rapid credential and session containment.",
      "Check whether one of the locations is actually a VPN egress or cloud app proxy.",
      "Privileged accounts can create persistence very quickly."
    ],
    stages: [
      {
        id: "ghost-stage-1",
        type: "identity",
        title: "Impossible Travel Trigger",
        content:
          "SIEM correlates an Azure admin portal login from Frankfurt followed by a successful Okta administrative login from Singapore four minutes later. The user's badge has not been used to enter HQ in two days.",
        systemLogs: [
          "[02:11:04] UEBA: impossible travel for admin.tsingh",
          "[02:11:07] OKTA: admin console access success from 45.88.19.41 (SG)",
          "[02:11:08] AZUREAD: privileged role operation pane opened"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "ghost-s1-c1",
            label: "Disable the account, revoke sessions, and page the on-call IAM lead immediately.",
            description: "Assume compromise because of privilege level.",
            icon: "UserX",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Privilege Window Narrowed",
              description: "Active sessions are disrupted before new identities are created.",
              scoreChange: 240,
              timeBonus: 10,
              consequences: [
                "The attacker loses direct console access.",
                "The IAM lead can validate whether any access was legitimate."
              ],
              nextStage: "ghost-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 30, insider: 0, breach: 8, network: 0 }
            }
          },
          {
            id: "ghost-s1-c2",
            label: "Check geo-IP reputation before touching the account.",
            description: "Validate the signal first to avoid a noisy false positive.",
            icon: "MapPinned",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Verification Costs Time",
              description: "The delay lets the session open new management blades and enumerate groups.",
              scoreChange: 60,
              timeBonus: -20,
              consequences: [
                "You reduce the chance of overreacting to travel analytics.",
                "Privilege abuse opportunities increase during review."
              ],
              nextStage: "ghost-stage-2",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 8, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "ghost-s1-c3",
            label: "Assume the engineer is on VPN and leave the account active.",
            description: "Treat impossible travel as a normal cloud quirk.",
            icon: "Route",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Admin Session Roams Free",
              description: "The attacker begins creating API tokens tied to an automation service principal.",
              scoreChange: -180,
              timeBonus: -25,
              consequences: [
                "Cloud persistence grows harder to unwind.",
                "You shift from possible compromise to active privileged intrusion."
              ],
              nextStage: "ghost-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "ghost-stage-2",
        type: "scope",
        title: "Service Principal Activity",
        content:
          "Audit logs show the account attempted to add a new credential to an existing automation service principal named `cloud-sync-prod`. Conditional Access blocked one attempt, but another token addition succeeded via Graph API.",
        systemLogs: [
          "[02:15:22] AZUREAD: Add service principal credential success",
          "[02:15:29] GRAPH: app role assignment read on directory",
          "[02:15:41] SOC: IAM lead confirms user is not traveling and is asleep"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "ghost-s2-c1",
            label: "Revoke the new credential, rotate impacted app secrets, and begin privileged access review.",
            description: "Remove persistence and validate exposure breadth.",
            icon: "KeySquare",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Persistence Broken",
              description: "The newly added credential is removed and service principal trust is reset.",
              scoreChange: 250,
              timeBonus: 5,
              consequences: [
                "Attacker foothold through automation is denied.",
                "Admin review begins on other high-privilege principals."
              ],
              nextStage: "ghost-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 28, insider: 0, breach: 10, network: 4 }
            }
          },
          {
            id: "ghost-s2-c2",
            label: "Delete the service principal entirely.",
            description: "Destroy the suspicious object to be safe.",
            icon: "Trash2",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Containment with Operational Damage",
              description: "Persistence is cut off, but production synchronization jobs fail immediately.",
              scoreChange: 80,
              timeBonus: 0,
              consequences: [
                "You stop abuse at the cost of a major business process.",
                "Recovery now includes rebuilding automation dependencies."
              ],
              nextStage: "ghost-stage-3",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 14, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "ghost-s2-c3",
            label: "Monitor the service principal for a few hours before changing anything.",
            description: "Try to catch downstream attacker actions.",
            icon: "Eye",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Persistence Matured",
              description: "The attacker uses the principal to enumerate mailbox and SharePoint permissions.",
              scoreChange: -150,
              timeBonus: -20,
              consequences: [
                "Potential data access expands beyond the original account.",
                "Containment becomes more complex and more public internally."
              ],
              nextStage: "ghost-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 5, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "ghost-stage-3",
        type: "validation",
        title: "Source of Access",
        content:
          "Threat intel maps the Frankfurt IP to a commercial VPN exit node. The Singapore login originated from a browser with a valid session cookie and MFA claim. Investigators suspect token theft from a compromised contractor laptop that accessed the engineer's admin workstation via screen-share last week.",
        systemLogs: [
          "[02:21:12] THREAT INTEL: 185.233.17.90 tagged as VPN relay",
          "[02:21:14] EDR: admin workstation shows remote support session 6 days earlier",
          "[02:21:20] OKTA: session cookie reused without fresh MFA challenge"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "ghost-s3-c1",
            label: "Invalidate all federation sessions, hunt for token theft artifacts, and quarantine the admin workstation.",
            description: "Pursue the likely root compromise vector.",
            icon: "ScanSearch",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Session Abuse Cut Off",
              description: "Token replay is interrupted and the probable source workstation is removed for triage.",
              scoreChange: 220,
              timeBonus: 10,
              consequences: [
                "Active browser session abuse is disrupted.",
                "Root cause investigation gets a viable starting point."
              ],
              nextStage: "ghost-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 4, intrusion: 24, insider: 0, breach: 8, network: 4 }
            }
          },
          {
            id: "ghost-s3-c2",
            label: "Focus only on directory logs and ignore the workstation angle.",
            description: "Stay inside cloud audit evidence.",
            icon: "CloudCog",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Partial Picture",
              description: "You protect the directory better, but leave the originating endpoint live and unexplained.",
              scoreChange: 75,
              timeBonus: 0,
              consequences: [
                "Cloud controls tighten.",
                "Endpoint root cause remains unresolved."
              ],
              nextStage: "ghost-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 12, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "ghost-s3-c3",
            label: "Re-enable the account after password reset because the logins are blocked now.",
            description: "Return the engineer to service quickly.",
            icon: "UserCheck",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Too Soon",
              description: "A stolen cookie still grants access to cloud management until token invalidation occurs.",
              scoreChange: -120,
              timeBonus: -10,
              consequences: [
                "The user regains access, but the attacker does too.",
                "Confidence in containment drops sharply."
              ],
              nextStage: "ghost-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 2, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "ghost-stage-4",
        type: "closure",
        title: "Privilege Hardening",
        content:
          "Leadership asks whether to consider the cloud directory breached. Your team has evidence of attempted persistence but limited evidence of successful data access. You need to decide the final recovery posture.",
        systemLogs: [
          "[02:28:32] SOC: no new admin actions in last 9 minutes",
          "[02:28:40] IAM: privileged identity management can enforce JIT elevation",
          "[02:28:49] GRC: asks whether breach threshold met"
        ],
        alertLevel: "Elevated",
        choices: [
          {
            id: "ghost-s4-c1",
            label: "Implement JIT admin access, rotate privileged secrets, and document as a contained privileged intrusion attempt.",
            description: "Reduce repeatability while preserving the incident record.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Ghost Login Closed",
              description: "You restore trust in the admin plane and leave the organization stronger than before.",
              scoreChange: 170,
              timeBonus: 15,
              consequences: [
                "Privileged access now requires time-bound elevation.",
                "Audit trail clearly captures attempted persistence and response."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 24, insider: 0, breach: 8, network: 4 }
            }
          },
          {
            id: "ghost-s4-c2",
            label: "Close the alert as resolved after the password reset.",
            description: "Treat the event as an isolated authentication anomaly.",
            icon: "BadgeCheck",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Hardening Opportunity Lost",
              description: "The immediate alert ends, but systemic privileged access gaps remain open.",
              scoreChange: -100,
              timeBonus: 5,
              consequences: [
                "Short-term workload drops.",
                "The same attack path may work again."
              ],
              nextStage: "end_partial",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 4, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "ghost-s4-c3",
            label: "Publicly state there was no compromise because no data theft is confirmed.",
            description: "Protect leadership messaging with certainty.",
            icon: "MegaphoneOff",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Narrative Overreaches Evidence",
              description: "Later review finds successful persistence attempts, forcing a correction under scrutiny.",
              scoreChange: -180,
              timeBonus: -10,
              consequences: [
                "Stakeholder trust erodes.",
                "The final report understates privileged exposure."
              ],
              nextStage: "end_failure",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Impossible Travel, Possible Win",
        description: "You treated privileged identity signals seriously, removed persistence, and improved the admin control plane."
      },
      failure: {
        title: "Privileged Intrusion Mishandled",
        description: "Underreacting to privileged impossible travel let persistence or poor messaging outlive the initial alert."
      },
      partial: {
        title: "Contained but Not Matured",
        description: "The immediate threat slowed, but the organization missed stronger hardening and clearer classification."
      }
    },
    learningObjectives: [
      "Prioritize privileged impossible travel differently from normal user travel anomalies.",
      "Remove persistence and session abuse, not just passwords.",
      "Use identity incidents to tighten privilege architecture."
    ],
    realWorldContext:
      "Cloud identity attacks often rely on session theft, API tokens, and service principal persistence rather than just password compromise.",
    references: [
      "Microsoft Identity Security Best Practices",
      "NIST SP 800-207 Zero Trust Architecture"
    ]
  },
  {
    id: "sqlstorm",
    title: "SQLStorm",
    category: "Breach",
    difficulty: "Advanced",
    timeLimit: 600,
    maxScore: 1000,
    description: "Attackers are exploiting a SQL injection flaw on the live checkout page of the e-commerce platform.",
    briefing: "Checkout error rates spiked, WAF logs show encoded payloads, and database CPU jumped to 95%.",
    backgroundStory:
      "The storefront is running a hotfix branch deployed this morning to support a flash sale. Engineering notes mention a last-minute coupon validation query built with string concatenation.",
    hints: [
      "Production SQL injection response is both security and availability work.",
      "Use containment that preserves evidence without leaving the app fully exposed.",
      "If payment data paths are involved, think early about breach obligations."
    ],
    stages: [
      {
        id: "sql-stage-1",
        type: "webapp",
        title: "Payloads on Checkout",
        content:
          "The WAF is logging requests against `/checkout/apply-coupon` containing `' UNION SELECT` strings and time-based payloads. Customer support says some carts are hanging for 30 seconds before payment.",
        systemLogs: [
          "[15:04:18] WAF: rule anomaly score 72 for /checkout/apply-coupon",
          "[15:04:19] APP: SQL timeout on coupon validation query",
          "[15:04:22] DB: CPU 95%, active locks 148"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "sql-s1-c1",
            label: "Disable coupon redemption endpoint at the WAF and notify engineering to place checkout in degraded mode.",
            description: "Contain the vulnerable function while keeping core sales alive.",
            icon: "ShieldAlert",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Injection Path Choked",
              description: "Attack traffic is cut from the vulnerable route and core checkout keeps processing without coupons.",
              scoreChange: 230,
              timeBonus: 10,
              consequences: [
                "Customer experience degrades, but payment flow survives.",
                "The exploitable endpoint stops taking direct attacker input."
              ],
              nextStage: "sql-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 10, insider: 0, breach: 28, network: 8 }
            }
          },
          {
            id: "sql-s1-c2",
            label: "Pull the entire storefront offline immediately.",
            description: "Maximize containment at the cost of revenue.",
            icon: "PowerOff",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Hard Stop",
              description: "The attack stops, but flash-sale revenue collapses and executives demand alternatives.",
              scoreChange: 80,
              timeBonus: -10,
              consequences: [
                "Exposure is reduced decisively.",
                "The business impact is severe and immediate."
              ],
              nextStage: "sql-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 4, insider: 0, breach: 12, network: 4 }
            }
          },
          {
            id: "sql-s1-c3",
            label: "Watch logs for a few more minutes to see whether the WAF blocks enough requests.",
            description: "Avoid disrupting a live sale before certainty.",
            icon: "Hourglass",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Attack Continues Live",
              description: "Time-based payloads continue hammering the database and attackers begin extracting schema names.",
              scoreChange: -170,
              timeBonus: -25,
              consequences: [
                "Availability worsens while exposure broadens.",
                "Your incident now includes active data discovery."
              ],
              nextStage: "sql-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "sql-stage-2",
        type: "forensics",
        title: "Database Evidence",
        content:
          "A DBA confirms the injected query path is hitting a read replica as well as production because the coupon service fan-outs to both. Logs show `information_schema.columns` queries and one response large enough to include customer email addresses.",
        systemLogs: [
          "[15:09:33] DB AUDIT: SELECT on information_schema.columns by app_user",
          "[15:09:37] CDN: response 200 size 184KB to coupon endpoint",
          "[15:09:40] DBA: read replica also executing malformed statements"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "sql-s2-c1",
            label: "Enable emergency parameterized hotfix, rotate app DB credentials, and preserve relevant query logs.",
            description: "Patch the flaw while cutting off any stolen connection context.",
            icon: "DatabaseZap",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Query Path Hardened",
              description: "Engineering deploys a prepared-statement fix and database access tokens are refreshed.",
              scoreChange: 250,
              timeBonus: 10,
              consequences: [
                "Exploitability drops sharply once the hotfix lands.",
                "Captured logs preserve evidence for later scoping."
              ],
              nextStage: "sql-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 12, insider: 0, breach: 30, network: 6 }
            }
          },
          {
            id: "sql-s2-c2",
            label: "Only increase WAF sensitivity and leave the application code for tomorrow's release.",
            description: "Rely on edge filtering instead of emergency code change.",
            icon: "Filter",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Shield Without Surgery",
              description: "Many payloads are blocked, but the vulnerable code remains reachable through variant encodings.",
              scoreChange: -70,
              timeBonus: 5,
              consequences: [
                "Traffic pressure eases slightly.",
                "The root cause remains deployed in production."
              ],
              nextStage: "sql-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 4, insider: 0, breach: 10, network: 10 }
            }
          },
          {
            id: "sql-s2-c3",
            label: "Delete the relevant logs to reduce exposure of customer data in internal systems.",
            description: "Remove sensitive records from log storage.",
            icon: "FileX2",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Evidence Destroyed",
              description: "You reduce internal log exposure but cripple breach scoping and audit defensibility.",
              scoreChange: -190,
              timeBonus: -10,
              consequences: [
                "Incident response loses crucial visibility.",
                "Legal and compliance teams inherit weak evidence."
              ],
              nextStage: "sql-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "sql-stage-3",
        type: "breach",
        title: "Did Data Leave?",
        content:
          "Packet captures show outbound responses large enough to contain sampled customer records, but no evidence of payment PANs because tokenized processing sits in a separate vault service. Marketing wants the flash sale back online in 30 minutes.",
        systemLogs: [
          "[15:17:05] PCAP: 14 large responses to 3 distinct attacker IPs",
          "[15:17:12] VAULT: no direct payment token vault access observed",
          "[15:17:16] MARKETING: requests ETA for sale restoration"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "sql-s3-c1",
            label: "Classify as probable customer data exposure, notify legal/privacy, and keep coupon feature disabled pending validation.",
            description: "Align communication with the evidence you actually have.",
            icon: "FileSearch2",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Accurate Breach Posture",
              description: "Stakeholders prepare for disclosure while engineering validates the hotfix under controlled conditions.",
              scoreChange: 210,
              timeBonus: 5,
              consequences: [
                "Privacy and legal can assess notification thresholds early.",
                "The business has a realistic path back to service."
              ],
              nextStage: "sql-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 8, insider: 0, breach: 26, network: 6 }
            }
          },
          {
            id: "sql-s3-c2",
            label: "Declare no breach because payment data wasn't touched.",
            description: "Narrow the issue to availability and app abuse.",
            icon: "BadgeInfo",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Scope Too Narrow",
              description: "The absence of PAN theft does not rule out exposure of emails and order history.",
              scoreChange: -110,
              timeBonus: 0,
              consequences: [
                "Leadership gets a misleading assurance.",
                "Later disclosure becomes harder to explain."
              ],
              nextStage: "sql-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 4, network: 0 }
            }
          },
          {
            id: "sql-s3-c3",
            label: "Re-enable coupons immediately after the hotfix deploy finishes, without extra validation.",
            description: "Prioritize revenue rebound over confidence testing.",
            icon: "ShoppingBag",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Business Pressure Wins",
              description: "Sales recover, but the team has little assurance variant injection paths are closed.",
              scoreChange: 50,
              timeBonus: 15,
              consequences: [
                "Revenue impact shortens.",
                "Security inherits a fragile confidence level."
              ],
              nextStage: "sql-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 8, network: 2 }
            }
          }
        ]
      },
      {
        id: "sql-stage-4",
        type: "recovery",
        title: "Controlled Return to Service",
        content:
          "QA can validate the hotfix within 12 minutes. Executives want the sale restarted with confidence and a customer statement ready if required.",
        systemLogs: [
          "[15:24:41] QA: prepared statement tests passing in staging",
          "[15:24:50] SOC: no new SQLi signatures after WAF suppression",
          "[15:24:58] PRIVACY: draft notice template available if needed"
        ],
        alertLevel: "Elevated",
        choices: [
          {
            id: "sql-s4-c1",
            label: "Run targeted validation, reopen coupon flow gradually, and retain heightened monitoring for 24 hours.",
            description: "Restore deliberately with strong observability.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "SQLStorm Deflected",
              description: "The site returns to normal under tighter controls and the incident record supports follow-on disclosure decisions.",
              scoreChange: 170,
              timeBonus: 15,
              consequences: [
                "Functionality is restored carefully instead of abruptly.",
                "Security and engineering keep a shared monitoring plan."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 6, insider: 0, breach: 22, network: 8 }
            }
          },
          {
            id: "sql-s4-c2",
            label: "Leave coupons disabled indefinitely and close once errors stop.",
            description: "Avoid the risk of reopening a sensitive feature.",
            icon: "Lock",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Safe but Heavy-Handed",
              description: "Security risk drops, but product and customer teams absorb avoidable operational pain.",
              scoreChange: 70,
              timeBonus: 0,
              consequences: [
                "Exposure stays low.",
                "Business confidence in security partnership weakens."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 2, insider: 0, breach: 10, network: 0 }
            }
          },
          {
            id: "sql-s4-c3",
            label: "Drop all logs and caches, reboot the database, and declare the issue fully resolved.",
            description: "Aim for a clean slate.",
            icon: "ServerCrash",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Clean Slate, Dirty Record",
              description: "The system stabilizes, but you erase traceability and weaken every downstream legal and engineering review.",
              scoreChange: -180,
              timeBonus: -10,
              consequences: [
                "Short-term symptoms disappear.",
                "Post-incident remediation lacks trustworthy evidence."
              ],
              nextStage: "end_failure",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Checkout Survives the Storm",
        description: "You contained the exploit path, patched the flaw, and managed probable customer exposure with discipline."
      },
      failure: {
        title: "Injection Becomes Breach",
        description: "Weak containment or poor evidence handling turned a live exploit into a harder-to-defend incident."
      },
      partial: {
        title: "System Stable, Questions Remain",
        description: "The immediate SQL injection pressure dropped, but the recovery or disclosure posture stayed weaker than it should."
      }
    },
    learningObjectives: [
      "Contain vulnerable functionality without always dropping the whole service.",
      "Preserve evidence while executing emergency hotfixes.",
      "Understand that non-payment customer data can still create a reportable breach."
    ],
    realWorldContext:
      "SQL injection remains a live risk when time pressure leads teams to bypass parameterization, especially in hotfixes or feature toggles.",
    references: [
      "OWASP SQL Injection Prevention Cheat Sheet",
      "NIST SP 800-61 Rev. 2"
    ]
  },
  {
    id: "the-mole",
    title: "The Mole",
    category: "Insider",
    difficulty: "Advanced",
    timeLimit: 540,
    maxScore: 1000,
    description: "A departing engineer may be exfiltrating proprietary design documents before resignation.",
    briefing: "HR quietly informs security that a principal engineer submitted notice and was denied a transfer to a competitor.",
    backgroundStory:
      "The engineer still has broad Git, CAD, and design-doc access. Leadership wants discretion because the employee is respected and deeply embedded in a strategic product line.",
    hints: [
      "Insider cases need precision and evidence preservation.",
      "Coordinate with HR and legal before confronting the employee.",
      "Think about cloud sync tools, personal email, and unusual repo export patterns."
    ],
    stages: [
      {
        id: "mole-stage-1",
        type: "behavior",
        title: "Notice from HR",
        content:
          "Within an hour of HR's note, DLP flags 2.4 GB of CAD files copied from the product share to a personal OneDrive folder through a browser session. The employee's laptop is still online.",
        systemLogs: [
          "[09:12:01] DLP: bulk download Product-X design archive",
          "[09:12:11] CASB: upload to personal OneDrive tenant",
          "[09:12:18] HR: employee resignation effective in 2 weeks"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "mole-s1-c1",
            label: "Coordinate with HR/legal and quietly suspend external sharing while preserving the workstation state.",
            description: "Contain without tipping off the employee prematurely.",
            icon: "UserRoundCog",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Quiet Containment",
              description: "External upload channels are restricted while evidence on the endpoint remains intact.",
              scoreChange: 230,
              timeBonus: 10,
              consequences: [
                "The employee is not immediately alerted.",
                "Evidence remains available for legal review."
              ],
              nextStage: "mole-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 6, insider: 30, breach: 12, network: 0 }
            }
          },
          {
            id: "mole-s1-c2",
            label: "Immediately confront the employee in a video call.",
            description: "Try to stop the behavior with direct pressure.",
            icon: "MessageCircleWarning",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Target Alerted",
              description: "The employee ends the call, disconnects from VPN, and may attempt local deletion.",
              scoreChange: -100,
              timeBonus: -15,
              consequences: [
                "Behavior changes before evidence is fully captured.",
                "The insider now knows security is watching."
              ],
              nextStage: "mole-stage-2",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 8, breach: 0, network: 0 }
            }
          },
          {
            id: "mole-s1-c3",
            label: "Ignore it because the employee might just be backing up personal work notes.",
            description: "Assume normal transition behavior.",
            icon: "UserCheck2",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Exfiltration Continues",
              description: "Additional source archives and vendor pricing spreadsheets leave the environment.",
              scoreChange: -180,
              timeBonus: -20,
              consequences: [
                "Data loss broadens beyond one share.",
                "Security loses the initiative."
              ],
              nextStage: "mole-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "mole-stage-2",
        type: "scope",
        title: "Repo Export Anomaly",
        content:
          "Git platform logs show the same employee created a personal access token two days ago and cloned three private repositories containing manufacturing calibration scripts. One repository was archived into a local zip this morning.",
        systemLogs: [
          "[09:18:41] GIT: personal access token created with repo scope",
          "[09:18:50] GIT: clone of calibration-core, firmware-pipeline, yield-analytics",
          "[09:18:56] EDR: archive utility compressing repo folders"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "mole-s2-c1",
            label: "Revoke the token, lock repo export privileges, and copy the relevant audit artifacts for counsel.",
            description: "Tighten access while preserving proof.",
            icon: "GitBranchLock",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Code Egress Cut Off",
              description: "Future repo pulls stop and your legal team gets a documented timeline of access.",
              scoreChange: 250,
              timeBonus: 10,
              consequences: [
                "Git misuse is frozen cleanly.",
                "Evidence becomes easier to act on in employment proceedings."
              ],
              nextStage: "mole-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 8, insider: 28, breach: 12, network: 0 }
            }
          },
          {
            id: "mole-s2-c2",
            label: "Delete the employee's repos from the workstation remotely.",
            description: "Remove copied material at once.",
            icon: "FolderX",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Evidence Spoiled",
              description: "Some copied files disappear, but chain-of-custody and intent evidence become much weaker.",
              scoreChange: -70,
              timeBonus: 5,
              consequences: [
                "You reduce immediate local availability of stolen data.",
                "Legal posture is weakened by remote tampering."
              ],
              nextStage: "mole-stage-3",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 10, breach: 0, network: 0 }
            }
          },
          {
            id: "mole-s2-c3",
            label: "Wait until the exit interview to discuss the clones.",
            description: "Handle it as an HR matter later today.",
            icon: "CalendarClock",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Delay Favors Insider",
              description: "The employee spends the next hour packaging additional documents to removable media.",
              scoreChange: -160,
              timeBonus: -15,
              consequences: [
                "Loss volume increases.",
                "Response options narrow once the employee leaves site."
              ],
              nextStage: "mole-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "mole-stage-3",
        type: "decision",
        title: "Executive Pressure",
        content:
          "The CTO wants the employee badge disabled immediately. HR warns that abrupt action may escalate confrontation and legal asks that you preserve an undisputed artifact trail before termination steps.",
        systemLogs: [
          "[09:27:05] BADGE SYS: account currently active on R&D floor",
          "[09:27:14] LEGAL: requests forensically sound collection",
          "[09:27:22] CTO: 'remove all access now'"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "mole-s3-c1",
            label: "Stage a coordinated offboarding: preserve evidence, escort the employee, disable access in sequence, and secure devices.",
            description: "Use a controlled insider response playbook.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Controlled Separation",
              description: "Access is removed cleanly and devices are collected without losing evidence or provoking a chaotic scramble.",
              scoreChange: 230,
              timeBonus: 5,
              consequences: [
                "HR, legal, and security act from the same plan.",
                "The employee has minimal opportunity for last-second data destruction."
              ],
              nextStage: "mole-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 6, insider: 26, breach: 10, network: 0 }
            }
          },
          {
            id: "mole-s3-c2",
            label: "Hard-disable every account and badge instantly without warning partners.",
            description: "Maximize speed over coordination.",
            icon: "LockKeyhole",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Fast but Rough",
              description: "Access ends quickly, but the employee reacts angrily and chain-of-custody on open devices becomes messy.",
              scoreChange: 90,
              timeBonus: 10,
              consequences: [
                "Immediate access ends.",
                "Evidence handling and internal trust suffer."
              ],
              nextStage: "mole-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 2, insider: 12, breach: 0, network: 0 }
            }
          },
          {
            id: "mole-s3-c3",
            label: "Do nothing until after legal finishes drafting a letter.",
            description: "Avoid procedural mistakes at the cost of time.",
            icon: "ScrollText",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Process Over Speed",
              description: "The employee keeps normal access long enough to email a compressed archive to a personal account.",
              scoreChange: -130,
              timeBonus: -20,
              consequences: [
                "Legal process is tidy but late.",
                "More intellectual property leaves the environment."
              ],
              nextStage: "mole-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 2, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "mole-stage-4",
        type: "closure",
        title: "Post-Incident Posture",
        content:
          "Counsel confirms enough evidence exists to pursue legal remedies. Leadership now wants to know whether to broaden insider monitoring across engineering and how to message the event internally.",
        systemLogs: [
          "[09:39:10] LEGAL: recommends preservation hold on affected data sources",
          "[09:39:18] HR: asks for internal comms language",
          "[09:39:24] SOC: no further uploads after access suspension"
        ],
        alertLevel: "Moderate",
        choices: [
          {
            id: "mole-s4-c1",
            label: "Implement tighter offboarding controls, targeted insider-risk monitoring, and need-to-know internal messaging.",
            description: "Fix the systemic gap without creating panic.",
            icon: "Radar",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Insider Path Closed",
              description: "The organization preserves evidence, limits rumor spread, and strengthens offboarding and exfiltration controls.",
              scoreChange: 160,
              timeBonus: 15,
              consequences: [
                "Future resignations get better security choreography.",
                "Engineering keeps trust because response stays proportionate."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 4, insider: 24, breach: 10, network: 0 }
            }
          },
          {
            id: "mole-s4-c2",
            label: "Roll out company-wide surveillance messaging and broad restrictive controls immediately.",
            description: "Send a deterrent signal to everyone.",
            icon: "EyeOff",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Trust Damaged",
              description: "Deterrence rises, but morale drops and leadership is criticized for overcorrecting.",
              scoreChange: 60,
              timeBonus: 0,
              consequences: [
                "Some risk is deterred.",
                "Organizational trust and culture take avoidable damage."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 8, breach: 2, network: 0 }
            }
          },
          {
            id: "mole-s4-c3",
            label: "Keep the incident secret and make no control changes to avoid upsetting engineering.",
            description: "Preserve short-term calm.",
            icon: "Ghost",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Quiet Lessons Lost",
              description: "The company avoids friction now, but insider risk controls remain weak and repeatable.",
              scoreChange: -170,
              timeBonus: 0,
              consequences: [
                "Leadership avoids immediate discomfort.",
                "The same offboarding weaknesses persist."
              ],
              nextStage: "end_failure",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "The Mole Unmasked",
        description: "You balanced discretion, evidence, and access control to stop insider exfiltration without losing legal footing."
      },
      failure: {
        title: "Insider Walks Away with IP",
        description: "Poor timing or weak coordination let sensitive engineering data leave beyond your reach."
      },
      partial: {
        title: "Insider Stopped, Culture Bruised",
        description: "The immediate exfiltration ended, but your broader response overreached or under-learned."
      }
    },
    learningObjectives: [
      "Coordinate insider investigations tightly with HR and legal.",
      "Preserve evidence before confrontational steps whenever feasible.",
      "Use insider incidents to improve offboarding and exfiltration guardrails."
    ],
    realWorldContext:
      "Insider incidents frequently blend legitimate access with suspicious intent, making evidence quality and proportional response especially important.",
    references: [
      "CERT Insider Threat Guide",
      "NIST SP 800-53 Insider Risk Related Controls"
    ]
  },
  {
    id: "floodgate",
    title: "FloodGate",
    category: "Network",
    difficulty: "Expert",
    timeLimit: 420,
    maxScore: 1000,
    description: "A DDoS campaign is degrading the payment gateway and cascading into checkout failures.",
    briefing: "Your payment gateway latency is spiking past 9 seconds during peak regional traffic.",
    backgroundStory:
      "The company relies on a third-party payment gateway fronted by your CDN and regional load balancers. Marketing is running a same-day promotion, which makes normal traffic and attack traffic harder to distinguish.",
    hints: [
      "Separate volumetric traffic handling from application health decisions.",
      "Coordinate with upstream providers early during DDoS.",
      "Graceful degradation can preserve revenue even when the main path is under pressure."
    ],
    stages: [
      {
        id: "flood-stage-1",
        type: "network",
        title: "Traffic Wall",
        content:
          "Inbound requests surge to 14x normal volume. SYN rates are spiking on the public load balancer while the payment API sees bursts of expensive TLS handshakes from globally distributed IP ranges.",
        systemLogs: [
          "[18:02:14] NLB: SYN rate 1.8M/min",
          "[18:02:17] CDN: cache hit ratio dropping, origin shield saturated",
          "[18:02:20] PAY API: P95 latency 9.4s"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "flood-s1-c1",
            label: "Activate DDoS mitigation with CDN provider and rate-limit suspicious payment paths.",
            description: "Push mitigation upstream while preserving good traffic.",
            icon: "CloudLightning",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Mitigation Begins Upstream",
              description: "Attack volume is scrubbed earlier in the path and origin saturation starts to ease.",
              scoreChange: 240,
              timeBonus: 10,
              consequences: [
                "Good traffic still experiences friction but fewer outright drops.",
                "Upstream provider joins the incident with live telemetry."
              ],
              nextStage: "flood-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 8, network: 32 }
            }
          },
          {
            id: "flood-s1-c2",
            label: "Add more origin servers and hope the extra capacity absorbs the load.",
            description: "Scale into the attack instead of filtering it.",
            icon: "Server",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Capacity Chase",
              description: "You gain a little headroom, but the attack scales with you and cost rises rapidly.",
              scoreChange: 70,
              timeBonus: -10,
              consequences: [
                "Short-lived latency improvement appears.",
                "Infrastructure cost and operator fatigue increase."
              ],
              nextStage: "flood-stage-2",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 10 }
            }
          },
          {
            id: "flood-s1-c3",
            label: "Do nothing yet because the promo might just be very successful.",
            description: "Wait for clearer separation between demand and attack.",
            icon: "TrendingUp",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Flood Wins the First Round",
              description: "Checkout failures spike and legitimate customers abandon carts while mitigation is delayed.",
              scoreChange: -180,
              timeBonus: -20,
              consequences: [
                "Revenue and user trust both drop quickly.",
                "The network team loses time that upstream providers could have used."
              ],
              nextStage: "flood-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "flood-stage-2",
        type: "service",
        title: "Gateway Degradation",
        content:
          "Even after edge filtering, the payment gateway vendor reports application-layer request floods against tokenization and fraud-check endpoints. Legitimate card authorizations are timing out.",
        systemLogs: [
          "[18:08:42] GATEWAY: auth timeout rate 31%",
          "[18:08:49] FRAUD API: connection pool exhausted",
          "[18:08:56] SUPPORT: merchants reporting duplicate purchase attempts"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "flood-s2-c1",
            label: "Switch checkout into queued payment mode with retry-safe idempotency keys.",
            description: "Protect customer transactions while the gateway recovers.",
            icon: "ClockArrowUp",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Graceful Degradation",
              description: "Customers can place orders while payment processing is buffered safely against duplicate charges.",
              scoreChange: 240,
              timeBonus: 10,
              consequences: [
                "Revenue flow stays partially open.",
                "Support burden drops because duplicate purchases are reduced."
              ],
              nextStage: "flood-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 6, network: 28 }
            }
          },
          {
            id: "flood-s2-c2",
            label: "Disable fraud checks completely so card auth can run faster.",
            description: "Trade fraud controls for performance.",
            icon: "ShieldOff",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Speed at a Cost",
              description: "Throughput improves, but chargeback and abuse exposure rise during an already unstable event.",
              scoreChange: -90,
              timeBonus: 15,
              consequences: [
                "Some legitimate orders succeed faster.",
                "Fraud risk balloons just as monitoring degrades."
              ],
              nextStage: "flood-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 4, network: 8 }
            }
          },
          {
            id: "flood-s2-c3",
            label: "Route all traffic directly to the gateway bypassing your CDN.",
            description: "Remove one layer to simplify the path.",
            icon: "RouteOff",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Protection Removed",
              description: "The gateway now takes raw attack volume and begins dropping almost all traffic.",
              scoreChange: -200,
              timeBonus: -15,
              consequences: [
                "You lose caching and filtering leverage.",
                "Vendor relationship becomes more strained during the outage."
              ],
              nextStage: "flood-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "flood-stage-3",
        type: "coordination",
        title: "Cross-Provider War Room",
        content:
          "The ISP, CDN, and gateway provider all request packet characteristics and business criticality. Leadership asks whether this is extortion-related because customer support received a message threatening sustained outages unless payment is sent in cryptocurrency.",
        systemLogs: [
          "[18:15:16] SUPPORT: extortion email references today's outage",
          "[18:15:23] ISP: requests 5-tuple samples and top source ASNs",
          "[18:15:27] EXEC: asks if ransom payment will stop attack"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "flood-s3-c1",
            label: "Run a provider war room, share telemetry, reject extortion payment, and prepare customer status updates.",
            description: "Coordinate upstream defense and communications together.",
            icon: "Handshake",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Defense Network Aligned",
              description: "Providers converge on tighter filtering while customer messaging becomes proactive and consistent.",
              scoreChange: 210,
              timeBonus: 10,
              consequences: [
                "Mitigation quality improves through shared data.",
                "Executives move away from paying attackers."
              ],
              nextStage: "flood-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 4, network: 24 }
            }
          },
          {
            id: "flood-s3-c2",
            label: "Keep provider details internal and handle the event only with your own team.",
            description: "Avoid coordination complexity.",
            icon: "UsersRound",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Limited Visibility",
              description: "Your team works hard, but mitigation remains less precise because upstream context is missing.",
              scoreChange: 60,
              timeBonus: -5,
              consequences: [
                "Operational control feels simpler.",
                "Response effectiveness is weaker than a shared war room."
              ],
              nextStage: "flood-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 10 }
            }
          },
          {
            id: "flood-s3-c3",
            label: "Recommend paying the extortion demand to restore service faster.",
            description: "Treat this as a commercial outage problem.",
            icon: "Coins",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Bad Incentive, No Guarantee",
              description: "Attackers continue traffic bursts after payment discussion leaks internally, and leadership confidence drops.",
              scoreChange: -180,
              timeBonus: -10,
              consequences: [
                "No reliable restoration path is gained.",
                "The company signals that extortion may work."
              ],
              nextStage: "flood-stage-4",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "flood-stage-4",
        type: "recovery",
        title: "Traffic Normalization",
        content:
          "Mitigation has reduced attack pressure, but traffic remains 3x baseline and the queued payment mode is still active. Leadership wants a decision on when to return to normal checkout behavior.",
        systemLogs: [
          "[18:22:48] CDN: mitigated requests stabilized",
          "[18:22:55] GATEWAY: auth timeout rate down to 4%",
          "[18:23:02] STATUS PAGE: customers requesting normal checkout ETA"
        ],
        alertLevel: "Elevated",
        choices: [
          {
            id: "flood-s4-c1",
            label: "Return gradually from queued mode, keep mitigation rules hot, and complete after-action tuning with providers.",
            description: "Stand down carefully while locking in lessons.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "FloodGate Holds",
              description: "Normal service returns under active monitoring, and the network stack emerges better tuned for the next surge.",
              scoreChange: 170,
              timeBonus: 15,
              consequences: [
                "Customers get a controlled return to full service.",
                "Provider runbooks improve with concrete traffic signatures."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 4, network: 22 }
            }
          },
          {
            id: "flood-s4-c2",
            label: "Switch everything back at once because metrics look better now.",
            description: "End the degraded mode quickly.",
            icon: "FastForward",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Recovery Jolt",
              description: "The platform mostly holds, but a brief second wave causes avoidable checkout turbulence.",
              scoreChange: 70,
              timeBonus: 15,
              consequences: [
                "Business likes the decisiveness.",
                "Operations absorb a sharp but avoidable wobble."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 10 }
            }
          },
          {
            id: "flood-s4-c3",
            label: "Keep payment processing disabled until tomorrow to be safe.",
            description: "Favor certainty over availability.",
            icon: "PauseOctagon",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Overcorrection",
              description: "Attack impact ends, but self-imposed downtime extends revenue loss far beyond what mitigation required.",
              scoreChange: -120,
              timeBonus: -15,
              consequences: [
                "Security feels cautious.",
                "The business bears unnecessary outage time."
              ],
              nextStage: "end_failure",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 4 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Traffic Surged, Payments Survived",
        description: "You handled DDoS as a multi-provider reliability incident and preserved the core business path."
      },
      failure: {
        title: "FloodGate Breaks",
        description: "Weak mitigation or poor recovery judgment let the attack dictate both network behavior and business outcomes."
      },
      partial: {
        title: "Outage Contained, Recovery Rough",
        description: "The DDoS subsided, but your return-to-service path created avoidable friction or instability."
      }
    },
    learningObjectives: [
      "Use upstream mitigation and provider coordination early in DDoS events.",
      "Preserve the business path through graceful degradation instead of all-or-nothing decisions.",
      "Treat extortion during DDoS carefully and avoid assuming payment creates relief."
    ],
    realWorldContext:
      "DDoS incidents often become cross-provider availability events where customer communication and graceful degradation matter as much as packet filtering.",
    references: [
      "NIST SP 800-61 Rev. 2",
      "Cloudflare DDoS Response Guidance"
    ]
  },
  {
    id: "trojan-update",
    title: "Trojan Update",
    category: "Malware",
    difficulty: "Expert",
    timeLimit: 600,
    maxScore: 1000,
    description: "A trusted vendor update is delivering malware through your software distribution pipeline.",
    briefing: "EDR detects suspicious DLL sideloading immediately after a widely deployed remote management tool update.",
    backgroundStory:
      "The vendor's update certificate is valid and the deployment was pushed through your standard endpoint management system overnight. Hundreds of systems have already received it, including domain administrators' workstations.",
    hints: [
      "Supply-chain incidents require decisive trust revocation.",
      "Signed software is not automatically safe once vendor trust is broken.",
      "Prioritize scoping where the update landed before focusing on attribution."
    ],
    stages: [
      {
        id: "trojan-stage-1",
        type: "supplychain",
        title: "Signed but Hostile",
        content:
          "The new vendor package passes signature validation, but EDR reports a post-install binary spawning `rundll32` with an unsigned DLL from `%ProgramData%\\VendorCache\\plugins`. Three admin workstations and thirty user endpoints show the same pattern.",
        systemLogs: [
          "[06:42:13] EDR: suspicious DLL load after vendor package install",
          "[06:42:18] PKI: Authenticode signature valid on installer",
          "[06:42:25] MDM: deployment success on 33 endpoints"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "trojan-s1-c1",
            label: "Halt the update rollout, quarantine impacted endpoints, and block the vendor package hash enterprise-wide.",
            description: "Revoke trust immediately and stop the spread.",
            icon: "ShieldBan",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Trust Revoked",
              description: "No additional systems receive the package and infected hosts are isolated from the network.",
              scoreChange: 240,
              timeBonus: 10,
              consequences: [
                "Software distribution is paused but under control.",
                "The compromise is constrained before full fleet impact."
              ],
              nextStage: "trojan-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 30, intrusion: 10, insider: 0, breach: 12, network: 8 }
            }
          },
          {
            id: "trojan-s1-c2",
            label: "Let rollout continue while validating whether EDR is producing false positives.",
            description: "Avoid halting an important vendor tool unnecessarily.",
            icon: "BadgeHelpCircle",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Compromise Scales",
              description: "By the time validation finishes, the malicious package is on 140 endpoints.",
              scoreChange: -190,
              timeBonus: -20,
              consequences: [
                "Containment workload increases dramatically.",
                "Privilege exposure grows because admin hosts are included."
              ],
              nextStage: "trojan-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "trojan-s1-c3",
            label: "Remove the EDR detection and trust the signed vendor binary.",
            description: "Assume the signature proves legitimacy.",
            icon: "BadgeCheck",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Signature Bias",
              description: "The package gains free execution time and begins staging encrypted outbound beacons.",
              scoreChange: -220,
              timeBonus: -15,
              consequences: [
                "Telemetry is suppressed right when you need it most.",
                "The malware's command channel has room to settle."
              ],
              nextStage: "trojan-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "trojan-stage-2",
        type: "scope",
        title: "Credential Reach",
        content:
          "One quarantined admin workstation had active domain admin credentials cached in LSASS before isolation. Network telemetry shows DNS-over-HTTPS traffic to a newly registered domain from several compromised hosts.",
        systemLogs: [
          "[06:48:55] EDR: LSASS access attempt by vendor child process",
          "[06:49:04] DNS: doh.syncmeshcdn.net newly registered 3 days ago",
          "[06:49:11] AD: admin workstation used for GPO changes earlier this morning"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "trojan-s2-c1",
            label: "Rotate privileged credentials, block malicious domains, and snapshot compromised hosts for forensics.",
            description: "Assume admin credential exposure and cut C2 channels.",
            icon: "KeyRound",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Privilege Risk Reduced",
              description: "Potentially exposed admin secrets are rotated before widespread domain abuse occurs.",
              scoreChange: 250,
              timeBonus: 10,
              consequences: [
                "Command and control paths are choked off.",
                "Domain-level blast radius remains manageable."
              ],
              nextStage: "trojan-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 28, intrusion: 18, insider: 0, breach: 8, network: 10 }
            }
          },
          {
            id: "trojan-s2-c2",
            label: "Focus only on vendor communications and wait for their root-cause statement.",
            description: "Rely on the supplier to confirm compromise scope.",
            icon: "PhoneIncoming",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Supplier Timeline Owns You",
              description: "The vendor acknowledges the issue hours later, but your environment remains at risk in the meantime.",
              scoreChange: -90,
              timeBonus: -15,
              consequences: [
                "You get supplier context eventually.",
                "Local containment lags behind attacker opportunity."
              ],
              nextStage: "trojan-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 6, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "trojan-s2-c3",
            label: "Re-image the admin workstations immediately without collecting volatile evidence.",
            description: "Prioritize cleanliness over visibility.",
            icon: "WandSparkles",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Clean but Blind",
              description: "Some risk is removed, but your team loses the ability to assess whether credentials or lateral tools were touched.",
              scoreChange: 60,
              timeBonus: 5,
              consequences: [
                "Infected machines disappear from the network quickly.",
                "Incident scoping gets much harder."
              ],
              nextStage: "trojan-stage-3",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 10, intrusion: 2, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "trojan-stage-3",
        type: "impact",
        title: "Vendor Admission",
        content:
          "The supplier confirms their build environment was compromised and the malicious update was available for six hours. You estimate 57 internal systems installed it, including one jump host used by the infrastructure team.",
        systemLogs: [
          "[06:57:34] VENDOR PSIRT: confirms build pipeline compromise",
          "[06:57:41] CMDB: 57 endpoints installed version 8.3.14",
          "[06:57:47] JUMP-01: package installed at 02:11 UTC"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "trojan-s3-c1",
            label: "Treat as a supply-chain breach, expand hunt to lateral movement, and notify executives and legal.",
            description: "Escalate the incident class to match the risk.",
            icon: "Siren",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Incident Class Raised Correctly",
              description: "The hunt expands beyond the update itself to follow-on credential or lateral activity.",
              scoreChange: 220,
              timeBonus: 5,
              consequences: [
                "Leadership understands the seriousness early.",
                "Jump host activity receives immediate scrutiny."
              ],
              nextStage: "trojan-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 22, intrusion: 16, insider: 0, breach: 18, network: 8 }
            }
          },
          {
            id: "trojan-s3-c2",
            label: "Keep the event classified as vendor instability until internal proof of data access exists.",
            description: "Avoid over-escalation before harder evidence appears.",
            icon: "TriangleAlert",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Classification Lags Reality",
              description: "The organization responds too narrowly while lateral movement review remains under-resourced.",
              scoreChange: -100,
              timeBonus: -10,
              consequences: [
                "Leadership urgency stays low.",
                "Potential compromise of privileged paths may be missed."
              ],
              nextStage: "trojan-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 4, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "trojan-s3-c3",
            label: "Pause the incident until the vendor provides a removal utility.",
            description: "Depend on the supplier for remediation steps.",
            icon: "PackageOpen",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Response Outsourced",
              description: "Malware remains in your environment while you wait for tooling you do not control.",
              scoreChange: -170,
              timeBonus: -15,
              consequences: [
                "Internal response stalls.",
                "Attackers retain the opportunity to exploit already-installed footholds."
              ],
              nextStage: "trojan-stage-4",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "trojan-stage-4",
        type: "recovery",
        title: "Trust Rebuild",
        content:
          "The malicious package is blocked and compromised hosts are being rebuilt. Engineering asks whether the vendor can ever be trusted again, and procurement wants a recommendation before renewing the contract next month.",
        systemLogs: [
          "[07:08:05] IR: no new DoH beacons after network blocks",
          "[07:08:14] IT: rebuild queue contains 57 hosts",
          "[07:08:20] PROCUREMENT: requests vendor risk decision"
        ],
        alertLevel: "Elevated",
        choices: [
          {
            id: "trojan-s4-c1",
            label: "Complete rebuilds, require vendor attestation and independent security review, and add tighter software trust controls internally.",
            description: "Recover and harden both sides of the supplier relationship.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Supply Chain Hardened",
              description: "You restore endpoints from trusted images and add stronger controls for future software provenance decisions.",
              scoreChange: 170,
              timeBonus: 15,
              consequences: [
                "The fleet returns from known-good baselines.",
                "Vendor management matures beyond signature trust alone."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 24, intrusion: 8, insider: 0, breach: 10, network: 6 }
            }
          },
          {
            id: "trojan-s4-c2",
            label: "Re-enable the vendor once they release a clean installer.",
            description: "Accept the vendor's fix at face value.",
            icon: "RefreshCcw",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Recovery Without Governance",
              description: "Operations resume, but supplier trust is restored faster than your internal controls have improved.",
              scoreChange: 60,
              timeBonus: 10,
              consequences: [
                "Tooling availability returns quickly.",
                "Strategic resilience remains underdeveloped."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 8, intrusion: 2, insider: 0, breach: 2, network: 0 }
            }
          },
          {
            id: "trojan-s4-c3",
            label: "Ignore procurement and treat this as a one-off vendor mistake.",
            description: "Focus only on technical clean-up.",
            icon: "CircleOff",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Technical Fix, Strategic Miss",
              description: "Systems recover, but the organization learns almost nothing about supplier assurance and trust revocation.",
              scoreChange: -120,
              timeBonus: 0,
              consequences: [
                "The present incident closes.",
                "The same governance gap remains for the next supplier issue."
              ],
              nextStage: "end_failure",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 4, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Vendor Trust Reclaimed Carefully",
        description: "You stopped the malicious update, rebuilt from clean images, and turned a supply-chain scare into stronger software trust controls."
      },
      failure: {
        title: "Trojan Update Leaves a Mark",
        description: "Overtrust in supplier signals or slow containment let a signed compromise dictate too much of the response."
      },
      partial: {
        title: "Contained but Not Reformed",
        description: "The malicious package was removed, but governance and supplier assurance did not improve enough."
      }
    },
    learningObjectives: [
      "Signed updates still require revocable trust.",
      "Supply-chain incidents must be scoped like local compromise, not just vendor mistakes.",
      "Recovery includes procurement and trust-policy decisions, not only malware cleanup."
    ],
    realWorldContext:
      "Supply-chain attacks can bypass many traditional trust signals because software arrives through legitimate channels with valid signatures.",
    references: [
      "CISA Supply Chain Risk Management Guidance",
      "NIST Secure Software Development Framework"
    ]
  },
  {
    id: "day-zero",
    title: "Day Zero",
    category: "Intrusion",
    difficulty: "Expert",
    timeLimit: 660,
    maxScore: 1000,
    description: "A zero-day exploit is targeting your unpatched VPN appliance from the internet.",
    briefing: "Threat intel reports active exploitation against your VPN model, and your edge telemetry shows suspicious requests matching the emerging pattern.",
    backgroundStory:
      "The appliance is critical for remote workforce access and sits in front of internal RDP and admin portals. There is no patch yet, only a vendor mitigation note published two hours ago.",
    hints: [
      "Zero-day response prioritizes exposure reduction and access-path decisions.",
      "Assume appliance logs may be incomplete or untrustworthy after exploitation.",
      "Think about credentials, sessions, and downstream internal access."
    ],
    stages: [
      {
        id: "zero-stage-1",
        type: "edge",
        title: "Exploit Chatter Turns Local",
        content:
          "Your SOC sees requests against the VPN web interface with the same URI pattern described in the vendor's mitigation note. A process on the appliance spawns unexpectedly and outbound connections begin to a VPS provider in Romania.",
        systemLogs: [
          "[21:14:02] EDGE WAF: request pattern matches vendor IOC",
          "[21:14:06] VPN: unexpected child process from web daemon",
          "[21:14:11] NETFLOW: outbound session to 193.142.44.19:443"
        ],
        alertLevel: "Critical",
        choices: [
          {
            id: "zero-s1-c1",
            label: "Pull the VPN appliance out of service, block known IOCs, and activate remote-access contingency plans.",
            description: "Reduce exposure immediately even without a patch.",
            icon: "PlugZap",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Exposure Surface Shrinks",
              description: "The exploit path is cut off and remote workers are shifted to contingency access routes.",
              scoreChange: 250,
              timeBonus: 10,
              consequences: [
                "Remote access is disrupted but controlled.",
                "Attackers lose their easiest foothold into the network."
              ],
              nextStage: "zero-stage-2",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 6, intrusion: 28, insider: 0, breach: 8, network: 12 }
            }
          },
          {
            id: "zero-s1-c2",
            label: "Apply only the vendor web-rule mitigation and keep the VPN online.",
            description: "Prefer business continuity while awaiting stronger proof.",
            icon: "ShieldEllipsis",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Mitigation, Not Closure",
              description: "The rule blocks obvious exploit strings, but you cannot be sure a foothold was not already established.",
              scoreChange: 80,
              timeBonus: 5,
              consequences: [
                "Remote access remains available.",
                "Trust in the appliance remains low."
              ],
              nextStage: "zero-stage-2",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 10, insider: 0, breach: 0, network: 4 }
            }
          },
          {
            id: "zero-s1-c3",
            label: "Wait for a vendor patch before taking the appliance down.",
            description: "Avoid disruption until a permanent fix exists.",
            icon: "ClockAlert",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Zero-Day Window Left Open",
              description: "The suspicious outbound sessions continue and additional exploit attempts land successfully.",
              scoreChange: -190,
              timeBonus: -20,
              consequences: [
                "The appliance remains exposed during active exploitation.",
                "Potential internal compromise becomes much more likely."
              ],
              nextStage: "zero-stage-2",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "zero-stage-2",
        type: "scope",
        title: "Was It Used Internally?",
        content:
          "Firewall logs show two short-lived connections from the VPN management subnet to a domain controller and an internal Git host shortly before you took action. Authentication logs show one successful VPN login from an account that should have been disabled last month.",
        systemLogs: [
          "[21:19:33] FW: VPN-MGMT -> DC-01 TCP/389 allowed",
          "[21:19:38] FW: VPN-MGMT -> GIT-INT-02 TCP/443 allowed",
          "[21:19:44] VPN AUTH: login success for disabled acct 'svc_fieldops'"
        ],
        alertLevel: "Severe",
        choices: [
          {
            id: "zero-s2-c1",
            label: "Reset potentially exposed credentials, hunt lateral movement from the appliance subnet, and disable stale accounts.",
            description: "Treat the VPN as a possible pivot point into the network.",
            icon: "SearchCode",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Pivot Risks Reduced",
              description: "Stale access paths are closed and the hunt begins where the appliance might have reached internally.",
              scoreChange: 250,
              timeBonus: 5,
              consequences: [
                "Old accounts stop providing easy cover for intruders.",
                "The search expands logically from edge to internal assets."
              ],
              nextStage: "zero-stage-3",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 4, intrusion: 30, insider: 0, breach: 10, network: 8 }
            }
          },
          {
            id: "zero-s2-c2",
            label: "Focus only on restoring employee VPN access and ignore the internal connections for now.",
            description: "Treat the main risk as remote-worker disruption.",
            icon: "Users",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Business Restored, Intrusion Unclear",
              description: "Users regain access faster, but any internal pivot from the appliance remains under-investigated.",
              scoreChange: -100,
              timeBonus: 15,
              consequences: [
                "Operational pain eases.",
                "Security confidence remains badly compromised."
              ],
              nextStage: "zero-stage-3",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 4, insider: 0, breach: 0, network: 2 }
            }
          },
          {
            id: "zero-s2-c3",
            label: "Assume the internal connections were just health checks and proceed with normal patch planning.",
            description: "Avoid expanding the incident based on thin evidence.",
            icon: "Activity",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "False Comfort",
              description: "A later hunt finds a web shell on the Git host that could have been prevented with earlier action.",
              scoreChange: -180,
              timeBonus: -10,
              consequences: [
                "The attack path gains time inside the network.",
                "Incident scope grows from appliance compromise to internal foothold."
              ],
              nextStage: "zero-stage-3",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          }
        ]
      },
      {
        id: "zero-stage-3",
        type: "intel",
        title: "No Patch, Only Workarounds",
        content:
          "The vendor releases updated mitigations but no patch. Security researchers report exploit chains leading to credential extraction from appliance memory. Your CIO wants to know whether the VPN can return this week.",
        systemLogs: [
          "[21:28:12] VENDOR: revised mitigation guidance published",
          "[21:28:16] THREAT INTEL: exploit may dump session secrets from memory",
          "[21:28:20] CIO: requests estimated return-to-service date"
        ],
        alertLevel: "High",
        choices: [
          {
            id: "zero-s3-c1",
            label: "Keep the appliance offline, deploy alternative remote access, and treat all VPN sessions as potentially exposed.",
            description: "Preserve trust by not relying on the compromised class of device.",
            icon: "ShieldCheck",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Trust Preserved Through Isolation",
              description: "Temporary access alternatives cost effort, but you avoid reintroducing a potentially untrustworthy appliance.",
              scoreChange: 220,
              timeBonus: 0,
              consequences: [
                "Business continuity shifts to fallback channels.",
                "Session exposure assumptions are handled conservatively."
              ],
              nextStage: "zero-stage-4",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 2, intrusion: 26, insider: 0, breach: 10, network: 12 }
            }
          },
          {
            id: "zero-s3-c2",
            label: "Bring the VPN back with the latest workarounds because downtime is too disruptive.",
            description: "Accept residual risk to restore normal operations.",
            icon: "Wifi",
            isOptimal: false,
            riskLevel: "High",
            outcome: {
              title: "Continuity Over Confidence",
              description: "Remote work resumes, but your security team cannot assert the appliance is trustworthy.",
              scoreChange: -110,
              timeBonus: 20,
              consequences: [
                "Users are relieved.",
                "Leadership inherits a known but poorly bounded risk."
              ],
              nextStage: "zero-stage-4",
              threatLevelChange: 1,
              skillXP: { phishing: 0, malware: 0, intrusion: 6, insider: 0, breach: 2, network: 4 }
            }
          },
          {
            id: "zero-s3-c3",
            label: "Replace the appliance entirely without preserving config or forensic artifacts.",
            description: "Rip and replace the platform instantly.",
            icon: "Replace",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Fast Swap, Weak Lessons",
              description: "You move off the vulnerable device, but lose too much evidence and configuration knowledge during the swap.",
              scoreChange: 70,
              timeBonus: 10,
              consequences: [
                "Exposure drops quickly.",
                "Incident learning and exact scoping suffer."
              ],
              nextStage: "zero-stage-4",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 10, insider: 0, breach: 0, network: 8 }
            }
          }
        ]
      },
      {
        id: "zero-stage-4",
        type: "closure",
        title: "Long Tail of a Zero-Day",
        content:
          "The hunt found no confirmed domain compromise, but the appliance can no longer be trusted. Leadership wants the final call on incident classification and the long-term access architecture.",
        systemLogs: [
          "[21:39:03] HUNT: no confirmed DC persistence found",
          "[21:39:08] IR: appliance integrity considered lost",
          "[21:39:13] ARCH: proposes ZTNA pilot for remote admin access"
        ],
        alertLevel: "Moderate",
        choices: [
          {
            id: "zero-s4-c1",
            label: "Classify as probable edge intrusion, retain the appliance for forensics, and accelerate a zero-trust remote access redesign.",
            description: "Close honestly and modernize the architecture.",
            icon: "Waypoints",
            isOptimal: true,
            riskLevel: "Low",
            outcome: {
              title: "Day Zero Survived",
              description: "You contain a hard edge-case incident and turn it into an architectural improvement instead of a recurring exposure.",
              scoreChange: 180,
              timeBonus: 15,
              consequences: [
                "The incident record matches the evidence without overclaiming.",
                "Remote access strategy improves beyond appliance dependence."
              ],
              nextStage: "end_success",
              threatLevelChange: -1,
              skillXP: { phishing: 0, malware: 0, intrusion: 24, insider: 0, breach: 10, network: 10 }
            }
          },
          {
            id: "zero-s4-c2",
            label: "Call it a false alarm because there is no proof of internal persistence.",
            description: "Avoid treating suspicion as compromise.",
            icon: "ShieldQuestion",
            isOptimal: false,
            riskLevel: "Critical",
            outcome: {
              title: "Edge Risk Minimized on Paper",
              description: "You understate the loss of appliance trust and miss the chance to strengthen remote access architecture.",
              scoreChange: -190,
              timeBonus: 5,
              consequences: [
                "Immediate optics improve.",
                "The organization stays vulnerable to the same class of edge trust failure."
              ],
              nextStage: "end_failure",
              threatLevelChange: 2,
              skillXP: { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }
            }
          },
          {
            id: "zero-s4-c3",
            label: "Close the incident after replacing the box and make no architectural changes.",
            description: "Treat the problem as purely hardware-specific.",
            icon: "Box",
            isOptimal: false,
            riskLevel: "Medium",
            outcome: {
              title: "Short-Term Fix, Long-Term Gap",
              description: "The immediate appliance issue ends, but remote access strategy remains too dependent on single edge trust points.",
              scoreChange: 50,
              timeBonus: 10,
              consequences: [
                "Replacement restores normalcy.",
                "The deeper lesson about access architecture is mostly lost."
              ],
              nextStage: "end_partial",
              threatLevelChange: 0,
              skillXP: { phishing: 0, malware: 0, intrusion: 8, insider: 0, breach: 2, network: 6 }
            }
          }
        ]
      }
    ],
    endStates: {
      success: {
        title: "Zero-Day, Not Zero Control",
        description: "You responded decisively without a patch, contained likely edge compromise, and improved the remote-access design."
      },
      failure: {
        title: "Edge Trust Collapses",
        description: "Underreacting to active exploitation left the organization exposed and the architecture unchanged."
      },
      partial: {
        title: "Appliance Replaced, Lessons Incomplete",
        description: "The immediate device problem ended, but the strategic response did not go far enough."
      }
    },
    learningObjectives: [
      "Respond to zero-days by reducing exposure, not waiting for perfect remediation.",
      "Assume compromised appliances may not tell the full truth in their own logs.",
      "Use edge incidents to revisit access architecture and single points of trust."
    ],
    realWorldContext:
      "Edge appliance zero-days often force defenders to choose between business continuity and trust, especially before a vendor patch exists.",
    references: [
      "CISA Known Exploited Vulnerabilities Catalog",
      "NIST SP 800-207 Zero Trust Architecture"
    ]
  }
];

export const scenariosById = Object.fromEntries(scenarios.map((scenario) => [scenario.id, scenario]));

export const categoryOptions = ["All", "Phishing", "Malware", "Intrusion", "Insider", "Breach", "Network"];
export const difficultyOptions = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];
