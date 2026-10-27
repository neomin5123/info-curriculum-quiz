# Build 39 — RAID 5 / 4-bit datapath verification

- Original source: user-provided `전공 기출_260921_105741.pdf`, PDF pages 137 and 155; the printed exam page labels differ.
- **2025-B-02**: 101001 XOR 100011 XOR 001110 = **000100**; 000001 XOR 110001 XOR 010111 = **100111**. Both answer components match the stored solution.
- **2026-B-08**: R1 has selector 01, destination R3 selector 11. Binary 0110 + 0100 gives 1010 with 4-bit retention. As signed 4-bit two's-complement values, 6+4 overflows (range −8..7); C3=1, C4=0, V=C3 XOR C4=1. All three answer components match.
- Verification: original diagram, conditions, independent bit calculations and stored answers cross-checked. **Procedural A grade**, not a statistical confidence score or official marking guide comparison.
- Previously recorded procedural A IDs: 21; new 2; cumulative **23** unique IDs. All previously recorded grades are carried forward, not reaudited.
- No existing exam answers or explanations modified. `2024-B-07` remains pending. Curriculum HWP and browser E2E were not checked.
