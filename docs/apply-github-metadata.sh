#!/usr/bin/env bash
# Apply descriptions + topics to all 14 ayanirfan099 repos.
#
# Why you must run this yourself: Arena's GitHub App grants contents:write and
# pull_requests:write, but NOT administration:write. Descriptions and topics live
# behind PATCH /repos/{owner}/{repo}, which needs Administration permission, so the
# agent gets HTTP 403 "Resource not accessible by integration" on every attempt.
#
# Usage:
#   gh auth login          # authenticate as ayanirfan099 with repo scope
#   bash apply-github-metadata.sh
#
# Add --dry-run to preview without changing anything.

set -uo pipefail

DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1

command -v gh >/dev/null || { echo "gh CLI not found: https://cli.github.com"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not authenticated. Run: gh auth login"; exit 1; }

read -r -d '' DATA <<'ROWS'
demo2-barber|Bilingual (DE/EN) barbershop booking demo built with React, TypeScript and Vite: Supabase appointments, Stripe checkout, Resend email and a Vapi AI voice receptionist, plus an owner dashboard.|react typescript vite tailwindcss supabase stripe vapi barbershop booking-system ai-receptionist i18n owner-dashboard demo-app
arena-viennacut|Bilingual German/English barber-studio demo on the Next.js App Router: TypeScript, Tailwind CSS v4, SQLite via node:sqlite and Zod, with a four-step booking flow and a server-gated owner dashboard.|nextjs react typescript tailwindcss sqlite zod barbershop booking-system i18n server-components demo-app
demo-viennacut|German-first Vienna barbershop demo on Next.js 16 with Prisma 7 and PostgreSQL: Europe/Vienna availability rules, exclusion-constraint conflict prevention, Better Auth owner sessions and Vitest/Playwright tests.|nextjs react typescript tailwindcss prisma postgresql better-auth booking-system vitest playwright i18n full-stack
burgerista|German-language interactive restaurant concept: animated hero, filterable menu, seven-stage scroll storytelling, accessible burger builder, and Vitest plus Playwright test suites. Self-hosted fonts, no third-party trackers.|nextjs react typescript tailwindcss animation restaurant accessibility playwright vitest german demo-app
telemetry-anomaly-ai|Unsupervised service-telemetry anomaly detection with Isolation Forest, a threshold calibrated on separate normal data, and per-batch population stability index (PSI) drift reports served over a JSON API.|python machine-learning anomaly-detection isolation-forest scikit-learn drift-detection telemetry observability json-api
evidence-search|Local document retrieval engine that returns ranked excerpts with exact file-and-line citations, fusing BM25 and TF-IDF rankings with reciprocal rank fusion. Lexical only: no LLM, no embeddings, no generated answers.|python information-retrieval bm25 tf-idf rag hybrid-search citations search-engine json-api
ticket-triage-ai|Support-ticket classifier routing requests to billing, account, technical or sales queues using TF-IDF and logistic regression, with confidence gating that defers uncertain inputs to human review. JSON API and held-out evaluation.|python nlp machine-learning text-classification tf-idf logistic-regression scikit-learn support-automation json-api
Websites|Dependency-free HTML, CSS and JavaScript practice pages: calculator, form validation, responsive layout, color picker, portfolio and a fictional university program, with Python and Node test checks.|html css javascript vanilla-js frontend learning-project web-development accessibility responsive-design
comparative-study-of-convolutional-neural-networks|Reproducible PyTorch CIFAR-10 study comparing a custom CNN, augmentation, frozen ResNet18 transfer learning and fine-tuning, with checkpoint selection, Grad-CAM analysis and a Streamlit demo.|pytorch deep-learning computer-vision cnn transfer-learning resnet cifar-10 grad-cam reproducibility streamlit
investigating-generalization-in-neural-networks|Controlled Fashion-MNIST ablation study of dropout, weight decay and image augmentation across 30 seeded CPU runs, with isolated splits, initial-weight hashing and paired test-accuracy analysis.|pytorch deep-learning generalization dropout weight-decay data-augmentation ablation-study fashion-mnist reproducibility research
academic-paper-retrieval-and-question-answering-system|Page-aware PDF retrieval combining BM25, FAISS vector search and reciprocal rank fusion, returning verbatim evidence with page citations and abstaining when support is missing. FastAPI and Streamlit interfaces.|rag retrieval-augmented-generation bm25 faiss information-retrieval pdf fastapi streamlit sentence-transformers question-answering citations
sentiment-classification-using-traditional-and-deep-learning-methods|Leakage-aware IMDb sentiment comparison of a majority baseline, TF-IDF logistic regression, linear SVM and pretrained DistilBERT inference, evaluated with macro-F1 and error/latency reporting.|nlp sentiment-analysis imdb tf-idf logistic-regression svm distilbert transformers scikit-learn text-classification
telecom-customer-churn-prediction-and-analysis|Leakage-resistant Telco churn study across seven sklearn candidates, with train-only preprocessing, a validation-selected threshold, single held-out evaluation, permutation and SHAP explanations, and a Streamlit dashboard.|machine-learning churn-prediction scikit-learn explainable-ai shap feature-engineering classification streamlit data-science
machine-learning-algorithms-from-first-principles|NumPy implementations of linear and logistic regression, K-nearest neighbours, K-means and PCA, with analytical gradient checks and measured comparisons against scikit-learn references.|machine-learning numpy from-scratch linear-regression logistic-regression knn kmeans pca gradient-descent python
ROWS

[[ $DRY -eq 1 ]] || echo "Checking write access to repository settings..."
probe=$([[ $DRY -eq 0 ]] && gh api --method PATCH "repos/ayanirfan099/evidence-search" -f description="$(gh api repos/ayanirfan099/evidence-search --jq '.description // ""')" 2>&1)
if [[ $DRY -eq 0 ]] && grep -q "not accessible by integration" <<<"$probe"; then
  cat <<'MSG'
FAILED: this token cannot edit repository settings (HTTP 403).

The token needs Administration (write) on these repos. That usually means a
personal access token with the `repo` scope, or a fine-grained token with
"Administration: Read and write". Create one at:
  https://github.com/settings/tokens

Then:  GH_TOKEN=ghp_xxx bash apply-github-metadata.sh
MSG
  exit 1
fi
[[ $DRY -eq 1 ]] || echo "OK — write access confirmed."
echo

ok=0; fail=0
while IFS='|' read -r name desc topics; do
  [[ -z "$name" ]] && continue
  if [[ $DRY -eq 1 ]]; then
    printf 'DRY  %-52s topics: %s\n' "$name" "$topics"
    ((ok++)); continue
  fi
  out=$(gh repo edit "ayanirfan099/$name" --description "$desc" --add-topic "$topics" 2>&1)
  if [[ $? -eq 0 ]]; then
    printf '  OK  %s\n' "$name"; ((ok++))
  else
    printf 'FAIL  %s :: %s\n' "$name" "$out"; ((fail++))
  fi
done <<< "$DATA"

echo
echo "Applied: $ok   Failed: $fail"
[[ $fail -eq 0 ]] || exit 1
