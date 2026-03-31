const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

// Clean up any broken references from previous attempt
code = code.replace(/\s*const \[chatMessages, setChatMessages\] = useState\(\[\]\);/g, '');
code = code.replace(/\s*const \[followUp, setFollowUp\] = useState\(""\);/g, '');
code = code.replace(/\s*const \[followUpLoading, setFollowUpLoading\] = useState\(false\);/g, '');
code = code.replace(/\s*setChatMessages\(\[[\s\S]*?\]\);/g, '');
code = code.replace(/\s*setFollowUp\(""\);/g, '');

// Also remove any broken handleFollowUp function
code = code.replace(/\s*const handleFollowUp = async \(\) => \{[\s\S]*?\n  \};\n/g, '');

// 1. Add states after res state
code = code.replace(
  'const [res, setRes] = useState(null);',
  `const [res, setRes] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [followUp, setFollowUp] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);`
);

// 2. After successful scan response, store the conversation
code = code.replace(
  `setRes({ mode: "chat", answer: data.answer, tips: data.tips || [], aiPowered: true });`,
  `setRes({ mode: "chat", answer: data.answer, tips: data.tips || [], aiPowered: true });
          setChatMessages([{ role: "user", content: text }, { role: "assistant", content: data.answer }]);`
);

// 3. Reset chat when starting a new scan (at the start of doScan)
code = code.replace(
  'const doScan = async () => {',
  `const doScan = async () => {
    setChatMessages([]);
    setFollowUp("");`
);

// 4. Add follow-up handler before doScan
code = code.replace(
  '// ===== SCAN with API =====',
  `// ===== FOLLOW-UP CHAT =====
  const handleFollowUp = async () => {
    if (!followUp.trim() || followUpLoading) return;
    const newMessages = [...chatMessages, { role: "user", content: followUp.trim() }];
    setChatMessages(newMessages);
    setFollowUp("");
    setFollowUpLoading(true);
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await resp.json();
      if (data.answer) {
        const clean = data.answer.replace(/\`\`\`json\\s*null\\s*\`\`\`/g, "").trim();
        setChatMessages([...newMessages, { role: "assistant", content: clean }]);
      }
    } catch (err) {
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  // ===== SCAN with API =====`
);

// 5. Strip json null from scan result display
code = code.replace(
  `{res.answer}`,
  `{res.answer.replace(/\`\`\`json\\s*null\\s*\`\`\`/g, "").trim()}`
);

// 6. Add chat UI after the res.answer display line
code = code.replace(
  `<div style={{ fontSize: "15px", lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{res.answer.replace(/\`\`\`json\\s*null\\s*\`\`\`/g, "").trim()}</div>`,
  `<div style={{ fontSize: "15px", lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{res.answer.replace(/\`\`\`json\\s*null\\s*\`\`\`/g, "").trim()}</div>

            {/* Follow-up messages */}
            {chatMessages.slice(2).map((msg, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                marginTop: "12px",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "rgba(255, 204, 0, 0.12)" : "rgba(255,255,255,0.04)",
                border: msg.role === "user" ? "1px solid rgba(255,204,0,0.25)" : "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                lineHeight: 1.7,
                color: T.text,
              }}>
                <div style={{ fontSize: "11px", color: msg.role === "user" ? T.accent : "#888", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                  {msg.role === "user" ? "You" : "RentScan AI"}
                </div>
                {msg.content}
              </div>
            ))}

            {/* Follow-up input */}
            {res && res.aiPowered && (
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
                  placeholder="Ask a follow-up question..."
                  disabled={followUpLoading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: T.text,
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={followUpLoading || !followUp.trim()}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    background: followUpLoading ? "#555" : "linear-gradient(135deg, " + T.accent + ", " + T.accent2 + ")",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: followUpLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {followUpLoading ? "..." : "Ask"}
                </button>
              </div>
            )}`
);

fs.writeFileSync(appPath, code);
console.log('Done! Chat feature properly added:');
console.log('  - chatMessages/followUp/followUpLoading states added');
console.log('  - Messages stored after scan');
console.log('  - Follow-up handler sends full conversation to API');
console.log('  - Follow-up messages shown below initial answer');
console.log('  - Input field with Enter support');
console.log('  - json null stripped from output');
console.log('  - Chat resets on new scan');
