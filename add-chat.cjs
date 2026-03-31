const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

// 1. Add chatMessages state after existing result state
if (!code.includes('chatMessages')) {
  // Find the result state declaration and add chatMessages after it
  code = code.replace(
    /const \[result, setResult\] = useState\([^)]*\);/,
    `const [result, setResult] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [followUp, setFollowUp] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);`
  );

  // 2. Modify the scan handler to also store the first message pair
  // Find where result is set from scan response and add chat message storage
  code = code.replace(
    /setResult\(data\.answer\);/,
    `setResult(data.answer);
          setChatMessages([
            { role: "user", content: contractText },
            { role: "assistant", content: data.answer }
          ]);
          setFollowUp("");`
  );

  // 3. Add the follow-up handler function before the return statement
  const followUpHandler = `
  const handleFollowUp = async () => {
    if (!followUp.trim() || followUpLoading) return;
    
    const newMessages = [...chatMessages, { role: "user", content: followUp.trim() }];
    setChatMessages(newMessages);
    setFollowUp("");
    setFollowUpLoading(true);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.answer) {
        setChatMessages([...newMessages, { role: "assistant", content: data.answer }]);
        setResult(data.answer);
      }
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setFollowUpLoading(false);
    }
  };

`;

  // Insert before the return statement
  code = code.replace(
    /(\n  return \()/,
    followUpHandler + '$1'
  );

  // 4. Add the chat UI after the existing result display
  // Find the result display section and add chat messages + follow-up input after it
  // Look for the div that displays the result
  const chatUI = `

            {/* Chat conversation */}
            {chatMessages.length > 2 && (
              <div style={{ marginTop: "20px" }}>
                {chatMessages.slice(2).map((msg, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    marginBottom: "10px",
                    borderRadius: "12px",
                    backgroundColor: msg.role === "user" ? "rgba(255, 204, 0, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    border: msg.role === "user" ? "1px solid rgba(255, 204, 0, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#fff",
                  }}>
                    <div style={{ fontSize: "11px", color: msg.role === "user" ? "#ffcc00" : "#888", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" }}>
                      {msg.role === "user" ? "You" : "RentScan AI"}
                    </div>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up input */}
            {chatMessages.length >= 2 && (
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
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={followUpLoading || !followUp.trim()}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: followUpLoading ? "#555" : "#ffcc00",
                    color: "#000",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: followUpLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {followUpLoading ? "..." : "Ask"}
                </button>
              </div>
            )}`;

  // Find the closing of the result display section
  // Look for a pattern after the result text is displayed - typically after dangerouslySetInnerHTML or after result text display
  // Try to find where the result section ends
  
  // Strategy: find the last occurrence of result being displayed and add chat UI after its parent div closes
  if (code.includes('dangerouslySetInnerHTML')) {
    // If result is rendered with dangerouslySetInnerHTML
    code = code.replace(
      /(dangerouslySetInnerHTML=\{\{[^}]+\}\}[^/]*\/>)/,
      '$1' + chatUI
    );
  } else if (code.includes('{result}')) {
    // If result is rendered directly
    // Find the div containing {result} and add chat UI after it
    code = code.replace(
      /(\{result\}\s*<\/div>)/,
      '$1' + chatUI
    );
  } else if (code.includes('result &&')) {
    // Conditional rendering of result
    code = code.replace(
      /(result && [\s\S]*?)(\n\s*\{\/\*|<\/div>\s*\n\s*\{\/\*)/,
      '$1' + chatUI + '\n$2'
    );
  }

  // 5. Reset chat when starting a new scan
  if (code.includes('setResult("")')) {
    code = code.replace(
      /setResult\(""\);/g,
      (match, offset) => {
        // Only add reset for the one in the scan handler (not in other places)
        if (code.substring(Math.max(0, offset - 200), offset).includes('handleScan') || 
            code.substring(Math.max(0, offset - 200), offset).includes('scanning') ||
            code.substring(Math.max(0, offset - 200), offset).includes('setLoading')) {
          return `setResult("");
    setChatMessages([]);`;
        }
        return match;
      }
    );
  }

  // Fix: make sure fetch URL uses relative path for follow-up too
  // The handleFollowUp already uses /api/scan which is correct

  fs.writeFileSync(appPath, code);
  console.log('Done! Chat conversation feature added:');
  console.log('  - Messages stored in chatMessages state');
  console.log('  - Follow-up input appears after first response');
  console.log('  - Full conversation history sent to API');
  console.log('  - New scan resets the conversation');
} else {
  console.log('Chat feature already present in App.jsx - skipping');
}
