from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf(filename="AI_Health_Assistant_Project.pdf"):
    # إعداد ملف PDF
    doc = SimpleDocTemplate(filename, pagesize=A4)

    # أنماط النصوص
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Heading1"], fontSize=22,
                                 alignment=1, textColor=colors.HexColor("#2C3E50"))
    subtitle_style = ParagraphStyle("subtitle", parent=styles["Heading2"], fontSize=16,
                                    textColor=colors.HexColor("#16A085"))
    normal_style = ParagraphStyle("normal", parent=styles["Normal"], fontSize=12, leading=18)

    # المحتوى
    content = []

    # العنوان الرئيسي
    content.append(Paragraph("🎓 مشروع التخرج", title_style))
    content.append(Spacer(1, 12))
    content.append(Paragraph("منصّة تشخيص طبي مبدئي باستخدام الذكاء الاصطناعي (AI Health Assistant)", subtitle_style))
    content.append(Spacer(1, 24))

    # الأقسام
    sections = [
        ("🔎 وصف الفكرة",
         "منصّة (موبايل + ويب) تساعد المستخدمين على التشخيص المبدئي للأعراض. يدخل المريض الأعراض نصياً أو صوتياً، "
         "ويقوم النظام بتحليلها عبر AI API (OpenAI / HuggingFace) لإعطاء احتمالات التشخيص وتوصيات بالإجراءات المناسبة."),

        ("👨‍💻 تقسيم الفريق",
         "- Flutter Devs (2): بناء التطبيق للموبايل.\n"
         "- React Dev (1): تطوير لوحة إدارة للأطباء.\n"
         "- Backend Dev (1): تطوير REST API والتكامل مع AI API وقاعدة البيانات."),

        ("⚙️ المميزات الأساسية",
         "- تسجيل الدخول (مريض / دكتور).\n- إدخال الأعراض نصياً أو صوتياً.\n- تحليل الأعراض عبر AI.\n"
         "- سجل صحي للمستخدم.\n- توصيات مبدئية وإرشادات.\n- Dashboard للأطباء لإدارة الحالات."),

        ("🛠️ التقنيات المستخدمة",
         "- Mobile: Flutter.\n- Backend Web: React + Tailwind.\n- Backend: Node.js / Laravel.\n"
         "- Database: PostgreSQL / MongoDB.\n- AI API: OpenAI / HuggingFace.\n- Other: Google Maps API."),

        ("🎯 مميزات المشروع",
         "مشروع طبي ذو قيمة أكاديمية ومجتمعية، يجمع بين Mobile + Web + Backend + AI. "
         "يعتمد على Public APIs قوية ويقدم ميزة تنافسية باللغة العربية وبتجربة استخدام سلسة."),

        ("📊 دراسة الجدوى",
         "- المشكلة: صعوبة معرفة إذا كانت الأعراض تستلزم زيارة الطبيب.\n"
         "- الحل: مساعد صحي ذكي يعتمد على الذكاء الاصطناعي.\n"
         "- المستفيدون: عامة الناس + الأطباء.\n"
         "- المنافسون: Ada Health, WebMD.\n"
         "- الميزة التنافسية: دعم لغات متعددة + AI متقدم + تكامل موبايل وويب.\n"
         "- النطاق الزمني: 3-4 شهور.\n"
         "- توزيع العمل: 40% Mobile, 30% Backend+AI, 20% Web, 10% Testing."),

        ("🎤 العرض (Pitch)",
         "مشروعنا هو منصّة تشخيص طبي مبدئي باستخدام الذكاء الاصطناعي. "
         "يدخل المستخدم أعراضه في التطبيق، ليقوم النظام بتحليلها عبر AI API وإرجاع احتمالات التشخيص مع توصيات بالإجراء المناسب. "
         "يمكن للأطباء متابعة الحالات عبر Dashboard مبني بـ React، بينما يعتمد الموبايل على Flutter لتوفير تجربة سلسة. "
         "المشروع يجمع بين الذكاء الاصطناعي والتطبيقات المتعددة والمنصّات الحديثة ليكون مشروعاً قوياً وقابلاً للتطبيق في الواقع.")
    ]

    # إضافة الأقسام
    for title, text in sections:
        content.append(Paragraph(title, subtitle_style))
        content.append(Spacer(1, 6))
        content.append(Paragraph(text.replace("\n", "<br/>"), normal_style))
        content.append(Spacer(1, 16))

    # بناء الملف
    doc.build(content)
    print(f"✅ تم إنشاء الملف: {filename}")

if __name__ == "__main__":
    generate_pdf()
