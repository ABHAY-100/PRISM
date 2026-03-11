<p align="center">
Secure Memory Hierarchy to Prevent Cross‑Session Poisoning in LLM Agents
</p>

<p align="justify">
Agentic AI systems built on large language models (LLMs) increasingly rely on long‑term memory to maintain user preferences, retain context across sessions, and accumulate task‑specific knowledge. However, this persistent memory introduces a new attack surface: adversaries can inject malicious content into an agent’s memory via indirect prompt injection or poisoned external data, causing harmful behavior to reappear long after the original interaction has ended. Existing defenses focus on input filtering, model alignment, or one‑shot prompt inspection, but largely ignore how untrusted information is stored, classified, and reused over time, leaving agents vulnerable to cross‑session injection persistence.
</p>

<p align="justify">
This project proposes a secure memory hierarchy for LLM‑based agents that treats memory as a security boundary rather than a passive datastore. The design partitions agent memory into three layers: (i) a scratch tier for single‑use external data and transient computations with zero persistence, (ii) a session tier for short‑lived conversational context with strict time‑to‑live policies, and (iii) a long‑term tier reserved for high‑trust information such as user preferences, protected using cryptographic signing and verification. An automated classifier combines source metadata and lightweight semantic analysis to route each new memory item to the appropriate tier, ensuring that untrusted or ambiguous content cannot silently migrate into long‑term storage. By enforcing isolation between tiers and requiring signature verification for retrieval from long‑term memory, the architecture prevents poisoned content from persisting across sessions or being upgraded in privilege.
</p>

<p align="justify">
The system will be evaluated using published memory‑poisoning attack patterns and benign interaction traces derived from recent work on red‑teaming LLM agents via knowledge‑base and memory poisoning. Experiments measure how often injected content can influence future sessions under different configurations, as well as the latency and storage overhead introduced by the hierarchy. Preliminary analysis suggests that cryptographically protected long‑term memory combined with strict routing and expiry policies can reduce successful cross‑session poisoning to near zero, with modest runtime cost compared to standard flat memory designs. This work aims to provide a practical, architecture‑level defense that complements prompt‑level filters and model alignment, moving agentic AI systems closer to secure, real‑world deployment.
</p>
