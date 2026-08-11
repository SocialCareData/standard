# **Standards for Assessments and Plans**

As part of the joined-up care workstream, we’re working on standardising care needs assessments and plans. Each are important components of an adult’s social care: an assessment is conducted when an adult contacts (or is referred to) a local authority’s social services team, and a social care plan is created immediately after if the person is assessed to be eligible.

This structure is based on the requirements of the [Care Act (2014),](https://www.legislation.gov.uk/ukpga/2014/23/contents) the primary legislation that governs adult social care in England. The Care Act enforces that all adults that may appear to have social care needs are assessed over 10 “outcomes”; if they are found to be unable to achieve some of these outcomes, the local authority has the duty to offer a personal budget and set out a care plan.

However, while this was national guidance, the actual structure of assessments and plans is not standardised. Local authorities across the country use different forms in different formats, some on CMS systems and others in simple word documents.

Of course, each has its own unique design for a reason. Social workers in one local authority may have different preferences to those in others, whether about the sort of information they collect or the way they record it. However, the limited standardisation makes interoperability and data sharing difficult. Instead of changing the front-end that social workers may like for its uniqueness, we therefore set out to standardise the back-end fields of information that might be shared between agencies and services.

We examined five assessments and two plans from different local authorities to ascertain what the most common fields were, how they were filled out, and what was important to standardise for sharing. After a session with the working group, we refined our draft, then ratified it at a technical level.

## **Foundational information**

Information that is relevant across assessments and plans.

Note that an assessment, as the first point of contact between a person and social services, should also involve filling out information about that person – ie. filling out a Person record for them.

| Property  | Data type  | Cardinality  | Description  | Rationale / further notes / open questions  |
| :---- | :---- | :---- | :---- | :---- |
| Identifier  | Identifier object  | 1..1  | Identifier for this assessment / plan  |   |
| PersonID  | Identifier object  | 1..1  | Identifier for the subject person    |   |
| ProfessionalID  | Identifier object  | 1..1  | Identifier for the professional that authored the assessment/plan  | Note that we don’t need a serviceID, because you can find the service through the professional. I think.  |
| dateCompleted  | DateTime  | 1..1  | Date and time that the assessment / plan was completed  |   |
| capacityToCompleteAssessment  | Boolean  | 1..1  | Does the person have the mental and physical capacity to complete this assessment / plan?  |   |
| advocateRequired  | Boolean  | 1..1  | Does the person require an advocate to complete this assessment / plan?  |   |
| consentToInformationSharing  | Boolean  | 1..1  | Does the person consent to information sharing?  |   |
| **Review (1..\*)**  |   |   |   |   |
| Review.isReview  | Boolean  | 1..1  | Whether this is a review of a previous assessment / plan or not  | Reviews are conducted yearly, but they’re actually duplicated assessment forms that are re-filled-out to assess whether package of care needs to increase or decrease. Given they’re the same form, we have  a flag here to distinguish.  |
| Review.previousID  | Identifier object  | 0..\*  | A link to the previous assessment / plan that is being reviewed.   | If this is a review, at least one previous assessment will have been conducted. If they have access to this assessment, they should link it to the review.    |

## **Assessment information**

From what we’ve seen across care act assessments, there’s a mix of statutory questions that are asked by all local authorities (eg. Does the person live alone?) and custom questions that some local authorities ask and some don’t. Given we’re not standardising these questions and instead standardising the format they’re stored in, we have to negotiate this in a way that respects customisation. The working group made it clear that the sharing of some of these custom questions should be up to their discretion, ie. optional.

To facilitate this, we are adopting a flexible, generic Question-and-Answer model. This aligns with team feedback, and is essentially a more abstract, metadata-driven standard. It works using questionID: a dictionary of codes we’ll maintain and publish, as a central standards authority, to describe statutory questions.

* **For Statutory fields:** The assessment must include specific questions mandated by the Care Act. For these, the local authority uses their preferred `questionText`, but they **must** attach the corresponding national `questionID` from our dictionary. This allows central systems to instantly find the data they need, regardless of how the local authority phrased the question.
* **For Local, personalised fields:** If a local authority wants to ask a custom, non-statutory question (like a specific "Pen Picture" prompt), they simply leave the `questionID` blank or use their own ID.

Essentially, this means that an assessment is just a set of generic AssessmentQuestions.

| Property  | Data type  | Cardinality  | Description  | Rationale / further notes / open questions  |
| :---- | :---- | :---- | :---- | :---- |
| PlanID  | Identifier  | 0..1  | Any care plan linked to this assessment  | Direct link between this assessment and a plan that might have come from it. Quick signpost that a) a plan was made (ie the person was determined to be eligible) and b) where the plan is (so you don’t need to search for it)  |
| status  | Enum  | 1..1  | Status of the plan. Lifted from FHIR carePlan    draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown    |   |
| **AssessmentQuestion (1..\*)**  |  |  |  |  |
| questionID  | String  | 0..1  | An ID for the question. For statutory questions, this should conform to the dictionary of statutory question IDs below; for personalised, non statutory questions, this can be anything.    | Has a mandatory code for statutory questions but is custom or left blank for local authority customised questions.    The dictionary that sits behind this is hard to explain, It’s linked with the below categories, and there’s an example in the table below.   |
| category  | Enum  | 1..1  | The domain of the question \* PersonalContext \* Health \* Housing  \* Finance  \* Communication needs  \* CA.nutrition   \* CA.hygiene   \* CA.toilet   \* CA.clothing   \* CA.homeSafety   \* CA.habitableHome   \* CA.maintainingRelationships   \* CA.WTEV   \* CA.communityServices   \* CA.responsibilityForOthers  \* Eligibility  \* Emergencies  \* Other       | CA \= Care Act, demarcating a specific reference to the Care Act outcomes    Essentially, this is a list of categories that statutory and custom questions sit within. There are statutory questions for eg. Housing, which would be “do they live alone”, as well as custom questions, like “Do they have to climb stairs to get to their flat”.    I wasn’t sure about having the care act outcomes here, but to be honest it simplifies things. The statutory question is always “Does the person currently achieve this outcome”, but some forms have more questions, more nuance, or variable answer types that make standardisation as in second and first drafts unsuitable.     |
| questionText  | Text  | 1..1  | The exact wording of the question as it appears on the local authority's form.  |   |
| answer  | String / value  | 1..\*  | The answer to the question as measured in the assessment  |   |
| answerType  | Enum  | 1..1  | Indicates how the answer should be parsed (e.g., String, Boolean, Date, Number, Enum).  | Ensures data like dates or booleans aren't trapped as unparsable text.  |
| required  | Boolean  | 1..1  | Whether this question was mandatory on the local authority’s assessment.   | Should always be True for statutory fields  |

### **Statutory questionID dictionary (set of statutory questions)**

| questionID  | Category  | Expected questionText  | Expected answerType  |
| :---- | :---- | :---- | :---- |
| STAT-HEALTH-01  | Health  | Does the person have previous or ongoing health conditions that may affect their day-to-day life?  | Boolean  |
| STAT-HOUSING-01  | Housing  | Does the person live alone?  | Boolean  |
| STAT-FINANCE-01  | Finance  | What is the client’s (potential) funding status?    | Enum   (Fully client funded,   Joint client and social care funded, Fully social care funded, Unknown )   |
| CA-NUTRITION-01  | Care act outcome  | Care act: Managing and maintaining nutrition. Does the person currently achieve this outcome?  | any  |
| CA-HYGIENE-01  | Care act outcome    | Care act: Maintaining personal hygiene. Does the person currently achieve this outcome?    | any    |
| CA-TOILET-01  | Care act outcome    | Care act: Managing toilet needs Does the person currently achieve this outcome?    | any    |
| CA-CLOTHING-01  | Care act outcome    | Care act: Being appropriately clothed. Does the person currently achieve this outcome?    | any    |
| CA-HOMESAFETY-01  | Care act outcome    | Care act: Being able to make use of the home safely. Does the person currently achieve this outcome?    | any    |
| CA-HABITABLEHOME-01  | Care act outcome    | Care act: Maintaining a habitable home environment. Does the person currently achieve this outcome?    | any    |
| CA-RELATIONSHIPS-01  | Care act outcome    | Care act: Developing and maintaining family or other personal relationships. Does the person currently achieve this outcome?    | any    |
| CA-WTEV-01  | Care act outcome    | Care act: Accessing and engaging in work, training, education, or volunteering. Does the person currently achieve this outcome?    | any    |
| CA-COMMUNITY-01  | Care act outcome    | Care act: Making use of necessary facilities or services in the local community, including public transport, and recreational facilities or services. Does the person currently achieve this outcome?    | any    |
| CA-CARINGOTHERS-01  | Care act outcome    | Care act: Carrying out any caring responsibilities for others. Does the person currently achieve this outcome?    | any    |
| CA-ELIGIBILITY-01  | Eligibility  | Have eligible needs been identified, according to the Care Act 2014?  | Enum (Eligible needs identified,  Non-eligible needs identified,  No needs identified)    |

### **Note – FHIR Questionnaire**

[https://build.fhir.org/questionnaire.html](https://build.fhir.org/questionnaire.html)
[https://build.fhir.org/questionnaireresponse.html](https://build.fhir.org/questionnaireresponse.html)

Actual implementation can leverage the FHIR **Questionnaire** and **QuestionnaireResponse** resources.

## **Plan information**

With plans, the main goal was again to structure the way information is shared behind the scenes. Here, narrative and contextual information that typically sits in a care plan (eg. question-answers like “what do you want to be able to achieve in a year’s time?”) would be shared, just procedural information about the care package that would be important for different agencies and organisations to know about. The standard therefore follows a rigid structure of who, what, and when.

| Property  | Data type  | Cardinality  | Description  | Rationale / further notes / open questions  |
| :---- | :---- | :---- | :---- | :---- |
| AssessmentID  | Identifier  | 1..1  | Assessment that led to this plan  | Direct link between assessments and plans.  |
| status  | Enum  | 1..1  | Status of the plan. Lifted from FHIR carePlan    draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown    |   |
| **CareComponent (1..\*)**  |  |  |  |  |
| **CareComponent.actor (1..\*)**  |  |  |  |  |
| CareComponent.actor.type  | Self  Family  Friend  Community  Other unpaid carer  Professional services  | 1..1  | The type of person performing the component of the plan. Subject person means the person themself.   |   |
| CareComponent.actor.ID  | Identifier object  | 1..1  | The ID of the person performing the item of the plan. Person ID, professional ID, or \-- most likely \-- service ID  |   |
| **CareComponent.time (1..1)**  |  |  |  |  |
| CareComponent.time.frequency  | [FHIR Timing](https://build.fhir.org/datatypes.html#timing)   | 1..1  | The frequency the component of the plan is performed (eg. weekly, every evening, once a month, etc.)  |     |
| CareComponent.time.startDateTime  | DateTime  | 1..1  | The first date the component of the plan was (scheduled to be) performed  |   |
| CareComponent.time.endDateTime  | DateTime  | 0..1  | The last date the component of the plan was performed before cancellation  |   |
| **CareComponent.activity (1..1)**  |  |  |  |  |
| CareComponent.activity.description  | Text  | 1..1  | Text description of the care component  | Importantly, if CareComponent.actor is a Service (eg. a meals-on-wheels business), this description is sort of already covered by following the serviceID to find its serviceCode or whatever. But this text field isn’t useless still, it can contain special instructions or specific information about how the activity should be carried out.  |
| CareComponent.activity.outcome  | CA-NUTRITION  CA-HYGIENE   CA-TOILET   CA-CLOTHING   CA-HOMESAFETY  CA-HABITABLEHOME  CA-RELATIONSHIPS  CA-WTEV  CA-COMMUNITY  CA-CARINGOTHERS      | 0..1  | Care act outcome that this care component is aiming to help the subject person achieve  |   |
| CareComponent.activity.directPayment  | Boolean  | 0..1  | Flag whether this component is paid via direct payment.  |   |

### **Note – FHIR CarePlan**

[https://build.fhir.org/careplan.html](https://build.fhir.org/careplan.html)

Actual implementation can utilise FHIR's dedicated **CarePlan** resource.

### **Note – narrative, descriptive questions, and being person-centric**

Working group felt the plan spec was service-centred rather than person-centred, which, although the point of our standard as something that sort of sits in the backend, is at odds with the overall objectives set by people in social care. We could be more person-centric by allowing custom question-answer pairs like “what does the person want to achieve in a year’s time?”. This implementation would be done in a similar way to AssessmentQA stuff. But probably wouldn’t require ID, category, or required flag.
