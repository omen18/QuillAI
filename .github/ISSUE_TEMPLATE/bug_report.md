---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]

**Quill Information**
- Version: [e.g, 0.1.0]

**Additional context**
Add any other context about the problem here.

**Relevant log output**
- Please share `config.yaml` with us, it should be located at `~/.quill/config.yaml`.
- Please share your logs with us with the following command:
    ```bash
    docker logs quill-quill-ui-1 >& quill-quill-ui.log && \
    docker logs quill-quill-service-1 >& quill-quill-service.log && \
    docker logs quill-quill-engine-1 >& quill-quill-engine.log && \
    docker logs quill-ibis-server-1 >& quill-ibis-server.log
    ```
