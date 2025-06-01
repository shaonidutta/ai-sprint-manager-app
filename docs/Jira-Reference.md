# Jira UI Structures Reference

This document outlines the key UI layout structures and reusable patterns seen across Jira Cloud for common user-facing pages like landing, auth, dashboards, and forms.

---

## 1. Landing Page ([https://www.atlassian.com/software/jira](https://www.atlassian.com/software/jira))

### Structure:

* **Top Navigation Bar**

  * Atlassian logo (left)
  * Product links (center)
  * Sign in / Try now CTA (right)

* **Hero Section**

  * Bold headline
  * Subheading / CTA
  * Illustration or animation

* **Feature Grid**

  * 3-column layout of feature blocks
  * Icons + headings + short descriptions

* **Testimonials / Social Proof**

  * Logos of companies using Jira
  * Short testimonials / trust banner

* **Call to Action Strip**

  * CTA bar: "Get Started for Free"

* **Footer**

  * 4-5 column layout (Products, Resources, Community, Company, Support)
  * Language switcher

---

## 2. Sign In / Sign Up

### Structure:

* **Center Aligned Card Layout**

  * Atlassian logo at top
  * Welcome / Instructional text
  * Email / password fields
  * Continue buttons (primary + OAuth options)

* **Password Reset / MFA Support**

  * Inline flow with steps (email → reset → confirm)

* **Link to switch between login and signup**

---

## 3. Main Dashboard

### Structure:

* **Left Sidebar (Collapsible)**

  * Jira logo / Project name
  * Menu items: Boards, Backlog, Reports, Issues
  * Bottom: Project settings / Help

* **Top Bar**

  * Global search input
  * Create button (plus icon)
  * Notifications / Avatar menu

* **Content Panel**

  * Responsive grid or table depending on module
  * Common views:

    * Board View (kanban/swimlane)
    * List View
    * Sprint Summary / Velocity Report

---

## 4. Boards (Scrum / Kanban)

### Structure:

* **Board Header**

  * Sprint name / date range
  * Sprint Goal (editable)
  * Filter bar (assignee, status, label)

* **Column Layout**

  * Horizontal scrollable columns (To Do, In Progress, Done)
  * Cards grouped vertically by status

* **Card Structure**

  * Issue Key + Summary
  * Assignee avatar / priority icon
  * Point estimate, tags

---

## 5. Backlog View

### Structure:

* **Sprint Lists (Collapsible)**

  * Current sprint + future sprint + backlog

* **Issue Cards**

  * Same card style as board
  * Drag & drop reordering

* **Sprint actions (right side)**

  * Start Sprint / Edit Sprint

---

## 6. Modal / Dialogs

### Common Uses:

* Create Issue
* Edit Issue
* Sprint Planning / Retrospectives

### Structure:

* Title bar
* Input fields / Selects / Date pickers
* Primary + Secondary button footer

---

## 7. Forms & Filters

### Structure:

* Stack layout or 2-column grid

* Field types:

  * Text input
  * Select / multiselect
  * Date pickers
  * Checkboxes / Toggles
  * Rich text (description)

* Common patterns:

  * Required field asterisk
  * Inline validation
  * Collapse advanced fields

---

## 8. Notifications / Alerts

* Inline alerts (top of forms / cards)
* Global toast (bottom-left)
* Icon-only badges for status

---

## 9. Other Reusable Patterns

* **Tabs** (Issue view, project settings)
* **Breadcrumbs** (top of page hierarchy)
* **Hover tooltips** (priority, icons)
* **Skeleton loaders** on data fetch

---

This structure provides a Jira-like UX foundation that can be re-implemented using Tailwind + component libraries.
