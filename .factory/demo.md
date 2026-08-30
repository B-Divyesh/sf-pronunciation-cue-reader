# Say It Right demo

Open `/demo/` or use the landing page’s **Try it with sample data** action.

The sample reader contains a short `docs.example.org` passage and three
realistic pronunciation cues: Kubernetes, PostgreSQL, and NASA. It displays
the selected words unchanged and shows the spoken cue for each matching chunk.
Visitors can add a sample pronunciation cue, use **Read sample aloud**, or reset the sample.

Demo storage uses only the browser key
`demo:pronunciation-cue-reader:cues`. It never reads or writes extension
storage or a real-reader namespace. The persistent banner offers **Reset demo**
to restore the sample and **Start for real** to discard the demo key before
returning visitors to the installation steps.
