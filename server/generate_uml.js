const fs = require('fs');
const zlib = require('zlib');

function encode(puml) {
    const deflated = zlib.deflateSync(puml, { level: 9 });
    return deflated.toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_');
}

const sysArch = `@startuml
skinparam handwritten false
skinparam defaultFontName Arial
skinparam node {
  BackgroundColor White
  BorderColor Black
}

node "Client Browser (React.js)" {
  [UI Components (Tailwind)] as UI
  [Context API / State] as State
  [Chatbot Widget Interface] as ChatUI
}

node "Node.js + Express Backend" {
  [API Gateway / Router] as Router
  [JWT Auth Controller] as Auth
  [AI Recommendation Engine] as RecEngine
  [NLP Chatbot Controller] as NLP
  [Payment Webhook Handler] as Payment
}

database "Supabase (PostgreSQL)" {
  [Users Table]
  [Orders & Transactions]
  [Food Inventory]
  [AI Interaction Logs]
}

cloud "External Cloud Infrastructure" {
  [Google Gemini (LLM)] as Gemini
  [Dodo Payments Hub] as Dodo
  [Nodemailer SMTP (Gmail)] as SMTP
}

UI <--> Router : REST / JSON
ChatUI <--> NLP : Async Fetch
State --> UI

Router --> Auth
Router --> RecEngine
Router --> NLP
Router --> Payment

Auth --> [Users Table] : CRUD
RecEngine --> [Food Inventory] : TF-IDF / Ranking
NLP --> [AI Interaction Logs] : Log Context
Payment --> [Orders & Transactions] : Update Status

NLP --> Gemini : Prompt Engineering
Payment --> Dodo : Initialize Checkout Session
Auth --> SMTP : Dispatch Secure OTP
Payment --> SMTP : Dispatch HTML Invoice
@enduml`;

const classDiag = `@startuml
skinparam classAttributeIconSize 0
skinparam defaultFontName Arial

class User {
  - UUID user_id
  - String name
  - String email
  - String password_hash
  - String auth_provider
  - Timestamp created_at
  + registerAccount()
  + verifyOTP(String code)
  + resetPassword()
}

class UserProfile {
  - UUID profile_id
  - JSONB category_weights
  - Float dietary_veg_score
  - Float engagement_multiplier
  + recalculateWeights(String action)
}

class FoodItem {
  - UUID food_id
  - String item_name
  - Float unit_price
  - String category
  - Boolean is_vegetarian
  - Boolean is_active
  + toggleAvailability()
  + updatePrice()
}

class AIChatbotEngine {
  - String session_id
  - Array message_history
  - Float temperature
  + extractEntities(String input)
  + constructPostgresQuery()
  + formatResponse()
}

class OrderTransaction {
  - UUID order_id
  - UUID user_id
  - Float total_amount
  - String payment_status
  - String payment_link
  - Timestamp order_time
  + initializeDodoSession()
  + verifyWebhookPayload()
  + dispatchInvoice()
}

class OrderItem {
  - UUID order_id
  - UUID food_id
  - Integer quantity
  - Float price_snap
}

User "1" *-- "1" UserProfile : owns
User "1" -- "*" OrderTransaction : places
OrderTransaction "1" *-- "*" OrderItem : contains
OrderItem "*" -- "1" FoodItem : references
User "1" -- "*" AIChatbotEngine : interacts
AIChatbotEngine "1" ..> "*" FoodItem : filters & ranks
@enduml`;

const useCaseDiag = `@startuml
left to right direction
skinparam defaultFontName Arial

actor "Customer" as cust
actor "Restaurant Admin" as rest
actor "System Automator" as sys

rectangle "Advanced AI Food Delivery Platform" {
  usecase "Authenticate via OTP" as UC1
  usecase "Browse ML Recommendations" as UC2
  usecase "Query AI Chatbot Assistant" as UC3
  usecase "Secure Dodo Payment" as UC4
  usecase "Track Live Order Status" as UC5
  
  usecase "Manage Live Inventory" as UC6
  usecase "View Analytics Dashboard" as UC7
  
  usecase "Extract NLP Intent" as UC8
  usecase "Dispatch Mail Server" as UC9
}

cust --> UC1
cust --> UC2
cust --> UC3
cust --> UC4
cust --> UC5

rest --> UC1
rest --> UC6
rest --> UC7

sys --> UC8
sys --> UC9

UC3 ..> UC8 : <<include>>
UC4 ..> UC9 : <<include>>
UC1 ..> UC9 : <<include>>
@enduml`;

const activityDiag = `@startuml
|Customer (Frontend)|
start
:Access Smart Food Platform;
:Requests Action (Browse / Chat);

|API Gateway|
if (Is Authenticated?) then (No)
  :Trigger Login / Registration;
  :Send SMTP OTP;
  |Customer (Frontend)|
  :Submit OTP;
  |API Gateway|
  :Issue JWT Session;
else (Yes)
endif

|AI Processing Node|
if (Action Type?) then (Chat Query)
  :Parse Natural Language;
  :Extract Dietary Entities;
  |Database Layer|
  :Execute Dynamic SQL Build;
  :Fetch Exact Food Match;
else (Home Browse)
  |Database Layer|
  :Fetch Core Inventory;
  |AI Processing Node|
  :Calculate Diversity Ratio (70/30);
  :Inject Algorithmic Picks;
endif

|Customer (Frontend)|
:Assemble Cart & Proceed to Pay;

|Payment Controller (Dodo)|
:Generate Secure Webhook Endpoint;
:Create Hosted Checkout URL;

|Customer (Frontend)|
:Complete Transaction;

|Payment Controller (Dodo)|
:Receive Webhook Success Event;
:Update Order Status to "Placed";

|Database Layer|
:Persist Order Details;
:Clear User Cart;

|API Gateway|
:Trigger Nodemailer Background Task;
:Email Confirmation Invoice;
stop
@enduml`;

const html = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Academic UML Diagrams</title>
    <style>
        body { font-family: 'Times New Roman', serif; max-width: 1000px; margin: 0 auto; padding: 40px; }
        h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
        p.desc { text-align: center; font-size: 14px; color: #333; margin-bottom: 40px; font-style: italic; }
        h2 { margin-top: 50px; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .img-container { 
           border: 1px solid #000; 
           padding: 20px; 
           text-align: center; 
           margin-top: 15px; 
           background: white; 
           box-shadow: 2px 2px 8px rgba(0,0,0,0.05);
        }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <h1>Advanced Software Engineering UML Diagrams</h1>
    <p class="desc">B.Tech Dissertation Technical Specifications - Generated via PlantUML</p>

    <!-- 1. Use Case Diagram -->
    <h2>1. Comprehensive Use Case Diagram (with <<include>> dependencies)</h2>
    <div class="img-container">
        <img src="https://kroki.io/plantuml/svg/\${encode(useCaseDiag)}" alt="Use Case">
    </div>

    <!-- 2. Class Diagram -->
    <h2>2. Architectural Class Diagram (Entity Relationships & Core Methods)</h2>
    <div class="img-container">
        <img src="https://kroki.io/plantuml/svg/\${encode(classDiag)}" alt="Class Diagram">
    </div>

    <!-- 3. System Architecture -->
    <h2>3. Cloud Service & System Architecture (Component level)</h2>
    <div class="img-container">
        <img src="https://kroki.io/plantuml/svg/\${encode(sysArch)}" alt="Architecture">
    </div>

    <!-- 4. Activity Diagram -->
    <h2>4. Cross-Functional Activity Diagram (Swimlane Execution)</h2>
    <div class="img-container">
        <img src="https://kroki.io/plantuml/svg/\${encode(activityDiag)}" alt="Activity">
    </div>

</body>
</html>\`;

fs.writeFileSync('../dissertation_diagrams_academic_strict.html', html);
console.log('Successfully generated extremely detailed academic UML!');

fs.writeFileSync('../dissertation_diagrams_academic_strict.html', html);
console.log('Successfully generated strict academic UML!');
