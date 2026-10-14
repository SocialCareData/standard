Any new controlled vocab is in **bold** and drafted below the table.

This standard has three objects: a Referral object, a Request object, and a Quality-of-Care Concern object.  The three are outlined below.

Each local authority will have their own custom forms with their own custom questions, so what we have below is a bare minimum, a core set of fields for each object. To facilitate atypical, locally-configured questions, we'll reuse the pattern we used for care act assessments that allows each local authority to write their own questions and categorise them to enable easy search and interoperability.

Aligns pretty easily with the NHS clinical referrals standard. 

| Category | Question | Answer types | How many answers |
| --- | --- | --- | --- |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Type | Vocab of **referral types** |  |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Subject: Who is the person? | Person object | 1..* |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Household: Who is in the person’s family, household, or network? | Tuple (Person object (likely ConnectedPerson shape)  + relationship code + text description) | 0..* |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Referrer: Who is the referrer? | Tuple (Person object / Professional object + {self, family member, professional, member of the public} + relationship description} | 1..1 |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Concern: What is the concern? | Vocab of **concerns** + free Text | 1..* |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Involvement: What have you or others done so far? | List of professional objects + free text description of involvement | 0..1 |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Pathway: What kind of support pathway do you think this referral should initiate? | ServiceCode with additions (see **outcomes** below) | 0..* |
| ♕ `Referral`(inward, person-centric, point-of-entry) | Recipient: Who was this referral sent to? | Organisation / Service identifier | 1..* |
| ♖ `Request`(outward request for services) | Subject: Who is the person? | Person identifier | 1..1 |
| ♖ `Request`(outward request for services) | Referrer: Who is the referrer? | Professional object | 1..1 |
| ♖ `Request`(outward request for services) | Recipient: What service is requested? | Organisation / Service identifier (OR service code?) | 1..* |
| ♖ `Request`(outward request for services) | Purpose: What is the request? | Vocab of **request purposes** | 1..1 |
| ♘ `qocConcern`(quality of care concern) | Subject: Who is the person? | Person object | 0..* (for anonymisation or maybe the service is just bad for everyone it serves) |
| ♘ `qocConcern`(quality of care concern) | Referrer: Who is the referrer? | Person object / Professional object | 0..1 (for anonymisation) |
| ♘ `qocConcern`(quality of care concern) | Recipient: What service is involved? | Organisation / Service identifier | 1..1  |
| ♘ `qocConcern`(quality of care concern) | Concern: What is the concern? | Vocab of **concerns** + free text  | 1..* |
| GENERIC FOR ALL | Atypical, locally configured questions | assessmentQuestion ! with **question category** | 0..* |
| GENERIC FOR ALL | Individual requirements / observed communication, cultural, cognitive, or mobility needs | This is part of the Person object in subject | 0..* |
| GENERIC FOR ALL | Attachments | Reference to a document | 0.. * |
| GENERIC FOR ALL | Other, related referrals | Tuple of of (Reference to other referral + **relationship between them**) | 0..* |
| GENERIC FOR ALL | Date completed | datetime | 0..1 |
|  |  |  |  |
**Referral types**

| **Code** | **Display** |
| --- | --- |
| `child.safeguarding` | Safeguarding concern, child |
| `child.infoRequest` | Information request, child |
| `child.crossService` | Professional concern about a child from engagement with an adult, child |
| `adult.general` | General referral to social care, adult |
| `adult.safeguarding` | Safeguarding concern, adult |
| `adult.independentLiving` | Request for occupational therapy or home equipment, adult |
| `adult.careActAssessment` | Request for care needs assessment or review, adult |
| `adult.infoRequest` | Information request, adult |
| `adult.crossService` | Professional concern about an adult from engagement with a child, adult |
**Concerns**

| **Code** | **Display** |
| --- | --- |
| `child.physicalAbuse` | Physical abuse, child |
| `child.sexualAbuse` | Sexual abuse, child |
| `child.emotionalAbuse` | Emotional abuse, child |
| `child.neglect` | Neglect, child |
| `child.exploitation` | Exploitation, child |
| `child.parentalConcern` | Parental mental health or substance abuse issues, child |
| `child.missingEducation` | Missing education, child |
| `child.goingMissing` | Going missing, child |
| `child.contextualRisk` | Contextual risk, child |
| `child.Other` | Other, child |
| `adult.physicalAbuse` | Physical abuse, adult |
| `adult.sexualAbuse` | Sexual abuse, adult |
| `adult.emotionalAbuse` | Emotional abuse, adult |
| `adult.neglect` | Neglect or acts of omission, adult |
| `adult.financialCoercion` | Financial coercion, adult |
| `adult.discrimination` | Discrimination, adult |
| `adult.domesticAbuse` | Domestic abuse, adult |
| `adult.modernSlavery` | Modern slavery, adult |
| `adult.selfHarm` | Self-neglect or self-harm, adult |
| `adult.substanceAbuse` | Substance abuse, adult |
| `adult.other` | Other, adult |
**Request purposes**

| **Code** | **Display** |
| --- | --- |
| `notification` | Notification or signposting |
| `child.earlyHelp` | Request to Early Help services, child |
| `child.CIN` | Escalation to s17 CiN assessment, child |
| `child.s47` | Escalation to s47 enquiry, child |
| `child.emergency` | Immediate emergency protection, child |
| `child.statutoryServices` | Request to statutory services (like CAMHS or advocacy), child |
| `child.nonStatutoryServices` | Request to non-statutory services, child |
| `adult.statutoryServices` | Request to statutory services (like NHS CHC or advocacy), adult |
| `adult.nonStatutoryServices` | Request to non-statutory services, adult |
**Outcomes (service codes)**

Should be service codes, with additions:

| **Code** | **Display** |
| --- | --- |
| `MASH` | MASH / safeguarding services |
| `early-help` | Early help |
| `education-welfare` | Education welfare officer |
| `home-adaptations` | Home adaptations |
| `occupational-therapy` | Occupational therapy |
| `CHC` | NHS CHC |
| `CMHT` | CMHT |
| `s117-aftercare` | S117 aftercare |
| `DoLS` | DoLs |
| `D2A` | D2A |
| `sensory-team` | Sensory teams |
| `advocacy` | Advocacy  |
| `LGA.<LGA Taxonomy Code>` | Loads of others that represent social or community organisations |
**Categories for atypical, locally-configured questions (as in** [**assessments standard](https://standard.socialcaredata.io/PUB05_assessments_and_plans_standard#question-category-taxonomy))**

| **Code** | **Display** |
| --- | --- |
| `REFERRAL_TYPE_ROUTING` | Referral type and routing |
| `REFERRER_DETAILS` | Referrer details |
| `SUBJECT.CONSENT_CAPACITY` | Person being referred (consent, awareness, capacity, authority) |
| `SUBJECT.DEMOGRAPHICS` | Person being referred (demographics) |
| `SUBJECT.ASSESSED_STATUS` | Person being referred (assessed status) |
| `CONCERN` | Concern and reason for referral |
| `RISK_HARM_SAFETY` | Risk, harm, and immediate safety |
| `FAMILY_NETWORK` | Family, household, and support network |
| `IMPACT_DAILY_LIFE` | Impact, needs, and daily life |
| `SUBJECT.VOICE_WISHES` | Subject's voice, wishes, and desired outcomes |
| `SUBJECT.SERVICES_NETWORK` | Current services, previous support and professional network |
| `STRENGTHS_POSITIVES` | Strengths, protective factors, and what is working well / signs of safety |
| `ACTIONS_TAKEN` | Actions already taken |
| `REQUESTED_SERVICE` | Requested service, response required, and next steps |
| `COMMUNICATION_ACCESSIBILITY` | Communication, accessibility, and adjustments |
| `ATTACHMENTS` | Attachments, evidence, and provenance |
| `SUBMISSION_WORKFLOW` | Submission and receiving-service workflow |
**Relationships between linked referrals**

See comment

| **Code** | **Display** |
| --- | --- |
| `escalationOf` | Escalation of |
| `deescalationOf` | Deescalation of |
| `followupTo` | Follow up to |
| `reactivationOf` | Reactivation of |
| `concurrentWith` | Concurrent with |

