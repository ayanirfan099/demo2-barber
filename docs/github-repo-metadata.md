# GitHub Repo Descriptions & Topics

Ready-to-paste metadata for all 14 public repos under `ayanirfan099`.
Descriptions are written to be **accurate** (no overclaiming), and all are under GitHub's 350-character limit.
Topics follow GitHub's rules: lowercase, hyphens allowed, ≤50 chars each, max 20 per repo.

---

## 1. `demo2-barber` — Barber shop booking demo
**Description**
> Bilingual (DE/EN) barbershop booking demo built with React, TypeScript and Vite: Supabase appointments, Stripe checkout, Resend email and a Vapi AI voice receptionist, plus an owner dashboard.

**Topics**
```
react typescript vite tailwindcss supabase stripe vapi barbershop booking-system ai-receptionist i18n owner-dashboard demo-app
```

---

## 2. `arena-viennacut` — Vienna Cuts (Next.js + SQLite)
**Description**
> Bilingual German/English barber-studio demo on the Next.js App Router: TypeScript, Tailwind CSS v4, SQLite via node:sqlite and Zod, with a four-step booking flow and a server-gated owner dashboard.

**Topics**
```
nextjs react typescript tailwindcss sqlite zod barbershop booking-system i18n server-components demo-app
```

---

## 3. `demo-viennacut` — Vienna Cuts (Next.js 16 + Prisma/Postgres)
**Description**
> German-first Vienna barbershop demo on Next.js 16 with Prisma 7 and PostgreSQL: Europe/Vienna availability rules, exclusion-constraint conflict prevention, Better Auth owner sessions and Vitest/Playwright tests.

**Topics**
```
nextjs react typescript tailwindcss prisma postgresql better-auth booking-system vitest playwright i18n full-stack
```

---

## 4. `burgerista` — Restaurant redesign concept
**Description**
> German-language interactive restaurant concept: animated hero, filterable menu, seven-stage scroll storytelling, accessible burger builder, and Vitest plus Playwright test suites. Self-hosted fonts, no third-party trackers.

**Topics**
```
nextjs react typescript tailwindcss animation restaurant accessibility playwright vitest german demo-app
```

---

## 5. `telemetry-anomaly-ai` — Anomaly detection
**Description**
> Unsupervised service-telemetry anomaly detection with Isolation Forest, a threshold calibrated on separate normal data, and per-batch population stability index (PSI) drift reports served over a JSON API.

**Topics**
```
python machine-learning anomaly-detection isolation-forest scikit-learn drift-detection telemetry observability json-api fastapi
```

---

## 6. `evidence-search` — Retrieval with citations
**Description**
> Local document retrieval engine that returns ranked excerpts with exact file-and-line citations, fusing BM25 and TF-IDF rankings with reciprocal rank fusion. Lexical only: no LLM, no embeddings, no generated answers.

**Topics**
```
python information-retrieval bm25 tf-idf rag hybrid-search citations search-engine json-api
```

---

## 7. `ticket-triage-ai` — Support ticket router
**Description**
> Support-ticket classifier routing requests to billing, account, technical or sales queues using TF-IDF and logistic regression, with confidence gating that defers uncertain inputs to human review. JSON API and held-out evaluation.

**Topics**
```
python nlp machine-learning text-classification tf-idf logistic-regression scikit-learn support-automation json-api
```

---

## 8. `Websites` — HTML/CSS/JS practice
**Description**
> Dependency-free HTML, CSS and JavaScript practice pages: calculator, form validation, responsive layout, color picker, portfolio and a fictional university program, with Python and Node test checks.

**Topics**
```
html css javascript vanilla-js frontend learning-project web-development accessibility responsive-design
```

---

## 9. `comparative-study-of-convolutional-neural-networks`
**Description**
> Reproducible PyTorch CIFAR-10 study comparing a custom CNN, augmentation, frozen ResNet18 transfer learning and fine-tuning, with checkpoint selection, Grad-CAM analysis and a Streamlit demo.

**Topics**
```
pytorch deep-learning computer-vision cnn transfer-learning resnet cifar-10 grad-cam reproducibility streamlit
```

---

## 10. `investigating-generalization-in-neural-networks`
**Description**
> Controlled Fashion-MNIST ablation study of dropout, weight decay and image augmentation across 30 seeded CPU runs, with isolated splits, initial-weight hashing and paired test-accuracy analysis.

**Topics**
```
pytorch deep-learning generalization dropout weight-decay data-augmentation ablation-study fashion-mnist reproducibility research
```

---

## 11. `academic-paper-retrieval-and-question-answering-system`
**Description**
> Page-aware PDF retrieval combining BM25, FAISS vector search and reciprocal rank fusion, returning verbatim evidence with page citations and abstaining when support is missing. FastAPI and Streamlit interfaces.

**Topics**
```
rag retrieval-augmented-generation bm25 faiss information-retrieval pdf fastapi streamlit sentence-transformers question-answering citations
```

---

## 12. `sentiment-classification-using-traditional-and-deep-learning-methods`
**Description**
> Leakage-aware IMDb sentiment comparison of a majority baseline, TF-IDF logistic regression, linear SVM and pretrained DistilBERT inference, evaluated with macro-F1 and error/latency reporting.

**Topics**
```
nlp sentiment-analysis imdb tf-idf logistic-regression svm distilbert transformers scikit-learn text-classification
```

---

## 13. `telecom-customer-churn-prediction-and-analysis`
**Description**
> Leakage-resistant Telco churn study across seven sklearn candidates, with train-only preprocessing, a validation-selected threshold, single held-out evaluation, permutation and SHAP explanations, and a Streamlit dashboard.

**Topics**
```
machine-learning churn-prediction scikit-learn explainable-ai shap feature-engineering classification streamlit data-science
```

---

## 14. `machine-learning-algorithms-from-first-principles`
**Description**
> NumPy implementations of linear and logistic regression, K-nearest neighbours, K-means and PCA, with analytical gradient checks and measured comparisons against scikit-learn references.

**Topics**
```
machine-learning numpy from-scratch linear-regression logistic-regression knn kmeans pca gradient-descent python
```

---

## Apply everything

> **Known blocker:** Arena's GitHub App (installation `arena-ai-coding-agent`) is granted
> `contents:write`, `pull_requests:write`, `workflows:write` and `repository_hooks:write`
> — but **not** `administration:write`. Repository descriptions and topics live behind
> `PATCH /repos/{owner}/{repo}`, which requires Administration permission, so the agent
> receives `HTTP 403 Resource not accessible by integration` on every attempt.
> Nothing in this file can be applied from the agent sandbox. Use `apply-github-metadata.sh`
> (below) with a token that has the `repo` scope, or paste these into the GitHub UI.

### Fastest path — run the script

```bash
cd docs && bash apply-github-metadata.sh --dry-run   # preview
GH_TOKEN=ghp_xxx bash apply-github-metadata.sh       # apply
```

The script preflights write access, applies all 14 repos, and reports per-repo OK/FAIL.
Requires a token with `repo` scope (classic) or `Administration: read and write` (fine-grained).

### Manual path — one command per repo

Run from anywhere (requires `gh` authenticated as `ayanirfan099`):

```bash
set -e

gh repo edit ayanirfan099/demo2-barber \
  --description "Bilingual (DE/EN) barbershop booking demo built with React, TypeScript and Vite: Supabase appointments, Stripe checkout, Resend email and a Vapi AI voice receptionist, plus an owner dashboard." \
  --add-topic react,typescript,vite,tailwindcss,supabase,stripe,vapi,barbershop,booking-system,ai-receptionist,i18n,owner-dashboard,demo-app

gh repo edit ayanirfan099/arena-viennacut \
  --description "Bilingual German/English barber-studio demo on the Next.js App Router: TypeScript, Tailwind CSS v4, SQLite via node:sqlite and Zod, with a four-step booking flow and a server-gated owner dashboard." \
  --add-topic nextjs,react,typescript,tailwindcss,sqlite,zod,barbershop,booking-system,i18n,server-components,demo-app

gh repo edit ayanirfan099/demo-viennacut \
  --description "German-first Vienna barbershop demo on Next.js 16 with Prisma 7 and PostgreSQL: Europe/Vienna availability rules, exclusion-constraint conflict prevention, Better Auth owner sessions and Vitest/Playwright tests." \
  --add-topic nextjs,react,typescript,tailwindcss,prisma,postgresql,better-auth,booking-system,vitest,playwright,i18n,full-stack

gh repo edit ayanirfan099/burgerista \
  --description "German-language interactive restaurant concept: animated hero, filterable menu, seven-stage scroll storytelling, accessible burger builder, and Vitest plus Playwright test suites. Self-hosted fonts, no third-party trackers." \
  --add-topic nextjs,react,typescript,tailwindcss,animation,restaurant,accessibility,playwright,vitest,german,demo-app

gh repo edit ayanirfan099/telemetry-anomaly-ai \
  --description "Unsupervised service-telemetry anomaly detection with Isolation Forest, a threshold calibrated on separate normal data, and per-batch population stability index (PSI) drift reports served over a JSON API." \
  --add-topic python,machine-learning,anomaly-detection,isolation-forest,scikit-learn,drift-detection,telemetry,observability,json-api

gh repo edit ayanirfan099/evidence-search \
  --description "Local document retrieval engine that returns ranked excerpts with exact file-and-line citations, fusing BM25 and TF-IDF rankings with reciprocal rank fusion. Lexical only: no LLM, no embeddings, no generated answers." \
  --add-topic python,information-retrieval,bm25,tf-idf,rag,hybrid-search,citations,search-engine,json-api

gh repo edit ayanirfan099/ticket-triage-ai \
  --description "Support-ticket classifier routing requests to billing, account, technical or sales queues using TF-IDF and logistic regression, with confidence gating that defers uncertain inputs to human review. JSON API and held-out evaluation." \
  --add-topic python,nlp,machine-learning,text-classification,tf-idf,logistic-regression,scikit-learn,support-automation,json-api

gh repo edit ayanirfan099/Websites \
  --description "Dependency-free HTML, CSS and JavaScript practice pages: calculator, form validation, responsive layout, color picker, portfolio and a fictional university program, with Python and Node test checks." \
  --add-topic html,css,javascript,vanilla-js,frontend,learning-project,web-development,accessibility,responsive-design

gh repo edit ayanirfan099/comparative-study-of-convolutional-neural-networks \
  --description "Reproducible PyTorch CIFAR-10 study comparing a custom CNN, augmentation, frozen ResNet18 transfer learning and fine-tuning, with checkpoint selection, Grad-CAM analysis and a Streamlit demo." \
  --add-topic pytorch,deep-learning,computer-vision,cnn,transfer-learning,resnet,cifar-10,grad-cam,reproducibility,streamlit

gh repo edit ayanirfan099/investigating-generalization-in-neural-networks \
  --description "Controlled Fashion-MNIST ablation study of dropout, weight decay and image augmentation across 30 seeded CPU runs, with isolated splits, initial-weight hashing and paired test-accuracy analysis." \
  --add-topic pytorch,deep-learning,generalization,dropout,weight-decay,data-augmentation,ablation-study,fashion-mnist,reproducibility,research

gh repo edit ayanirfan099/academic-paper-retrieval-and-question-answering-system \
  --description "Page-aware PDF retrieval combining BM25, FAISS vector search and reciprocal rank fusion, returning verbatim evidence with page citations and abstaining when support is missing. FastAPI and Streamlit interfaces." \
  --add-topic rag,retrieval-augmented-generation,bm25,faiss,information-retrieval,pdf,fastapi,streamlit,sentence-transformers,question-answering,citations

gh repo edit ayanirfan099/sentiment-classification-using-traditional-and-deep-learning-methods \
  --description "Leakage-aware IMDb sentiment comparison of a majority baseline, TF-IDF logistic regression, linear SVM and pretrained DistilBERT inference, evaluated with macro-F1 and error/latency reporting." \
  --add-topic nlp,sentiment-analysis,imdb,tf-idf,logistic-regression,svm,distilbert,transformers,scikit-learn,text-classification

gh repo edit ayanirfan099/telecom-customer-churn-prediction-and-analysis \
  --description "Leakage-resistant Telco churn study across seven sklearn candidates, with train-only preprocessing, a validation-selected threshold, single held-out evaluation, permutation and SHAP explanations, and a Streamlit dashboard." \
  --add-topic machine-learning,churn-prediction,scikit-learn,explainable-ai,shap,feature-engineering,classification,streamlit,data-science

gh repo edit ayanirfan099/machine-learning-algorithms-from-first-principles \
  --description "NumPy implementations of linear and logistic regression, K-nearest neighbours, K-means and PCA, with analytical gradient checks and measured comparisons against scikit-learn references." \
  --add-topic machine-learning,numpy,from-scratch,linear-regression,logistic-regression,knn,kmeans,pca,gradient-descent,python
```

## Verify afterwards

```bash
gh repo list ayanirfan099 --limit 100 --json name,description,repositoryTopics \
  --jq '.[] | "\(.name)\n  desc: \(.description)\n  topics: \(.repositoryTopics|map(.name)|join(", "))\n"'
```

## Optional follow-ups

- **PINNED REPOS:** pin the strongest six — `telecom-customer-churn-prediction-and-analysis`, `academic-paper-retrieval-and-question-answering-system`, `investigating-generalization-in-neural-networks`, `demo2-barber`, `burgerista`, and `machine-learning-algorithms-from-first-principles`. Pinning is a profile setting, not a repo setting, so it has to be done in the GitHub UI.
- **MISSING README:** `demo2-barber` still ships the stock Vite template README. It is the only repo whose README does not describe the project.
- **OVERLAP:** `demo-viennacut`, `arena-viennacut` and `demo2-barber` are three takes on the same barbershop concept. Consider archiving `demo-viennacut` and keeping two, or naming each one's distinguishing technique in its description (already done above for the first two).
