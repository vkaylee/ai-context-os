# Guide for Testing Fallback Architecture

To verify that the AI understands and adheres to the Fallback structure (prioritizing project-specific rules before falling back to OS rules), you can follow this test scenario:

## 🧪 Test Scenario

### Step 1: Set up Test Environment
1. Create a completely new project directory (e.g., `my-test-project`).
2. Copy the core files of `ai-context-os` into this directory (`PROJECT_OS.md`, `.cursorrules`, `CLAUDE.md`, and the `skills` folder).

### Step 2: Declare a Custom Rule (Priority 1)
In the `my-test-project` directory, create a local rule file to override OS standards. You can create `skills/custom-rule.md`:

```markdown
# My Custom Override
> Mandatory Requirement: When writing Python code, NEVER use the `requests` library; only `httpx` is allowed.
> This is a project-specific rule and takes absolute priority over any default rules.
```

Ensure your root pointer files (`.cursorrules` or `CLAUDE.md`) are configured to make the Agent read the `skills/` folder (including your new custom file).

### Step 3: Give a Task to the AI
Open `my-test-project` with your AI Agent. Enter the following prompt:

> "Write a small Python script to download REST API data from https://jsonplaceholder.typicode.com/posts/1"

### Step 4: Verify the Results (Expected Outcome)
- **If AI uses `httpx`**: The test is **SUCCESSFUL**. This proves the AI adhered to your `custom-rule.md` (Priority 1) override.
- **If AI uses `requests` or another library**: The test **FAILED**. The AI either didn't understand the priority structure or the configuration files are not linking the custom files correctly.

## 💡 Mechanism Explanation
In `PROJECT_OS.md` (Priority 2), `requests` is not prohibited. But because your project has a `custom-rule.md` (Priority 1) that forbids it, the Fallback mechanism takes effect: the AI obeys the Custom Rule first. If you delete `custom-rule.md`, the AI will revert to using `requests` as per default behavior.
