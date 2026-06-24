import type { ReportLanguage, ReportRule } from "./types";

export const reportLanguageLabels: Record<ReportLanguage, string> = {
  en: "en",
  es: "es",
  zh: "zh",
};

export const reportUiCopy: Record<
  ReportLanguage,
  {
    languageLabel: string;
    reportTitle: string;
    reportIntro: string;
    needsAttention: string;
    passedChecks: string;
    businessImpact: string;
    responsibleOwner: string;
    fixDifficulty: string;
    estimatedFixTime: string;
    fixSteps: string;
    copyForTechnician: string;
    copied: string;
    technicalResults: string;
    technicalIntro: string;
    noRisksTitle: string;
    noRisksText: string;
  }
> = {
  en: {
    languageLabel: "Report language",
    reportTitle: "Business-friendly security report",
    reportIntro:
      "Use this section to understand the issue in business terms and send clear instructions to the person who manages the website.",
    needsAttention: "Needs attention",
    passedChecks: "Passed checks",
    businessImpact: "Business impact",
    responsibleOwner: "Responsible owner",
    fixDifficulty: "Fix difficulty",
    estimatedFixTime: "Estimated fix time",
    fixSteps: "Fix steps",
    copyForTechnician: "Copy for technician",
    copied: "Technician note copied.",
    technicalResults: "Original technical results",
    technicalIntro:
      "These are the raw scanner results. They are kept for the website technician and are secondary to the business report above.",
    noRisksTitle: "No urgent business risks found",
    noRisksText:
      "The current checks passed or only need review. Keep monitoring before major website, DNS, or email changes.",
  },
  es: {
    languageLabel: "Idioma del informe",
    reportTitle: "Informe de seguridad para negocios",
    reportIntro:
      "Use esta sección para entender el problema en lenguaje de negocio y enviar instrucciones claras a la persona que mantiene el sitio web.",
    needsAttention: "Necesita atención",
    passedChecks: "Controles aprobados",
    businessImpact: "Impacto para el negocio",
    responsibleOwner: "Responsable",
    fixDifficulty: "Dificultad",
    estimatedFixTime: "Tiempo estimado",
    fixSteps: "Pasos para corregir",
    copyForTechnician: "Copiar para técnico",
    copied: "Nota para el técnico copiada.",
    technicalResults: "Resultados técnicos originales",
    technicalIntro:
      "Estos son los resultados técnicos sin traducir. Se mantienen para el técnico del sitio y son secundarios al informe de negocio anterior.",
    noRisksTitle: "No se encontraron riesgos urgentes",
    noRisksText:
      "Los controles actuales aprobaron o solo necesitan revisión. Mantenga el monitoreo antes de cambios importantes en web, DNS o correo.",
  },
  zh: {
    languageLabel: "报告语言",
    reportTitle: "面向企业的安全报告",
    reportIntro:
      "本部分用业务语言解释问题，并提供可直接发送给网站维护人员的修复说明。",
    needsAttention: "需要处理",
    passedChecks: "已通过项目",
    businessImpact: "业务影响",
    responsibleOwner: "负责人员",
    fixDifficulty: "修复难度",
    estimatedFixTime: "预计修复时间",
    fixSteps: "修复步骤",
    copyForTechnician: "复制给技术人员",
    copied: "技术说明已复制。",
    technicalResults: "原始技术结果",
    technicalIntro:
      "以下是扫描器的原始技术结果，主要供网站技术人员参考，业务报告以上方内容为准。",
    noRisksTitle: "未发现紧急业务风险",
    noRisksText:
      "当前检查已通过或只需复核。网站、DNS 或邮件配置发生重大变化前后，请继续监测。",
  },
};

export const reportSummaries: Record<
  ReportLanguage,
  {
    low: string;
    medium: string;
    high: string;
  }
> = {
  en: {
    low: "The public signals checked here look mostly healthy. The report is still useful as a maintenance note for your website or email provider.",
    medium:
      "The site has a few configuration gaps that can affect trust, email delivery, or browser protection. These are usually fixable by the website host, developer, or email provider.",
    high: "Several public protections are missing or need review. Treat this as a practical to-do list for your website technician before customers rely on the site for trust or contact.",
  },
  es: {
    low: "Las señales públicas revisadas se ven en buen estado. El informe sigue siendo útil como nota de mantenimiento para su web o proveedor de correo.",
    medium:
      "El sitio tiene algunas brechas de configuración que pueden afectar la confianza, la entrega de correo o la protección del navegador. Normalmente las puede corregir el hosting, el desarrollador o el proveedor de correo.",
    high: "Faltan varias protecciones públicas o requieren revisión. Use esto como una lista práctica para su técnico antes de depender del sitio para confianza o contacto con clientes.",
  },
  zh: {
    low: "本次检查的公开安全信号总体良好。该报告仍可作为网站或邮件服务的维护记录。",
    medium:
      "网站存在一些配置缺口，可能影响客户信任、邮件送达或浏览器保护。通常可由主机商、网站开发人员或邮件服务商修复。",
    high: "多个公开保护项缺失或需要复核。建议把这份报告作为技术人员的待办清单，再让客户依赖网站进行访问或联系。",
  },
};

export const statusLabels: Record<
  ReportLanguage,
  {
    ok: string;
    warning: string;
    bad: string;
  }
> = {
  en: {
    ok: "Passed",
    warning: "Needs review",
    bad: "Needs attention",
  },
  es: {
    ok: "Aprobado",
    warning: "Revisar",
    bad: "Necesita atención",
  },
  zh: {
    ok: "已通过",
    warning: "需要复核",
    bad: "需要处理",
  },
};

export const reportRules: Record<string, Record<ReportLanguage, ReportRule>> = {
  ssl: {
    en: {
      title: "Secure connection certificate",
      explanation:
        "This checks whether customers can open your website through a trusted secure connection.",
      businessImpact:
        "If this is weak or expired, browsers may show warnings and customers may leave before contacting you.",
      responsibleOwner: "Website host or web developer",
      fixDifficulty: "Medium",
      estimatedFixTime: "30 minutes to 2 hours",
      fixSteps: [
        "Ask the host or developer to check the TLS/SSL certificate.",
        "Renew or reinstall the certificate if it is expired or not trusted.",
        "Confirm the website opens cleanly at https:// without browser warnings.",
      ],
      technicianText:
        "Verify the TLS certificate chain, hostname match, expiry date, and HTTPS configuration. Renew or reinstall the certificate if the chain is invalid or near expiry.",
    },
    es: {
      title: "Certificado de conexión segura",
      explanation:
        "Comprueba si los clientes pueden abrir el sitio con una conexión segura y confiable.",
      businessImpact:
        "Si está débil o vencido, el navegador puede mostrar alertas y los clientes pueden abandonar el sitio.",
      responsibleOwner: "Hosting web o desarrollador",
      fixDifficulty: "Media",
      estimatedFixTime: "30 minutos a 2 horas",
      fixSteps: [
        "Pida al hosting o desarrollador que revise el certificado TLS/SSL.",
        "Renueve o reinstale el certificado si está vencido o no es confiable.",
        "Confirme que el sitio abre en https:// sin advertencias del navegador.",
      ],
      technicianText:
        "Verificar cadena TLS, coincidencia de nombre de host, fecha de caducidad y configuración HTTPS. Renovar o reinstalar el certificado si la cadena no es válida o está por vencer.",
    },
    zh: {
      title: "安全连接证书",
      explanation:
        "检查客户是否可以通过受信任的安全连接打开您的网站。",
      businessImpact:
        "如果证书有问题或过期，浏览器可能显示警告，客户可能在联系您之前离开。",
      responsibleOwner: "网站主机商或网站开发人员",
      fixDifficulty: "中等",
      estimatedFixTime: "30 分钟到 2 小时",
      fixSteps: [
        "请主机商或开发人员检查 TLS/SSL 证书。",
        "如果证书过期或不受信任，请续期或重新安装。",
        "确认网站可通过 https:// 正常打开，且浏览器没有警告。",
      ],
      technicianText:
        "检查 TLS 证书链、主机名匹配、到期时间和 HTTPS 配置。如证书链无效或即将到期，请续期或重新安装证书。",
    },
  },
  httpsRedirect: {
    en: {
      title: "Automatic HTTPS redirect",
      explanation:
        "This checks whether visitors who type the old non-secure address are automatically moved to the secure website.",
      businessImpact:
        "Without this redirect, some customers may land on a less trusted version of the site.",
      responsibleOwner: "Website host or web developer",
      fixDifficulty: "Easy to medium",
      estimatedFixTime: "15 minutes to 1 hour",
      fixSteps: [
        "Configure the website or hosting panel to redirect HTTP traffic to HTTPS.",
        "Use a permanent redirect so bookmarks and search engines learn the secure address.",
        "Test http:// and https:// versions after the change.",
      ],
      technicianText:
        "Configure a 301 redirect from HTTP to HTTPS at the CDN, host, web server, or application layer. Verify final URLs resolve to HTTPS.",
    },
    es: {
      title: "Redirección automática a HTTPS",
      explanation:
        "Comprueba si los visitantes que usan la dirección antigua no segura pasan automáticamente al sitio seguro.",
      businessImpact:
        "Sin esta redirección, algunos clientes pueden llegar a una versión menos confiable del sitio.",
      responsibleOwner: "Hosting web o desarrollador",
      fixDifficulty: "Fácil a media",
      estimatedFixTime: "15 minutos a 1 hora",
      fixSteps: [
        "Configure el sitio o panel de hosting para redirigir HTTP a HTTPS.",
        "Use una redirección permanente para que favoritos y buscadores aprendan la dirección segura.",
        "Pruebe las versiones http:// y https:// después del cambio.",
      ],
      technicianText:
        "Configurar redirección 301 de HTTP a HTTPS en CDN, hosting, servidor web o aplicación. Verificar que las URLs finales resuelvan en HTTPS.",
    },
    zh: {
      title: "自动跳转到 HTTPS",
      explanation:
        "检查访问旧的不安全地址时，客户是否会自动进入安全网站。",
      businessImpact:
        "如果没有跳转，部分客户可能进入可信度较低的网站版本。",
      responsibleOwner: "网站主机商或网站开发人员",
      fixDifficulty: "简单到中等",
      estimatedFixTime: "15 分钟到 1 小时",
      fixSteps: [
        "在网站或主机面板中配置 HTTP 到 HTTPS 的跳转。",
        "使用永久跳转，让收藏夹和搜索引擎识别安全地址。",
        "修改后测试 http:// 和 https:// 两个版本。",
      ],
      technicianText:
        "在 CDN、主机、Web 服务器或应用层配置 HTTP 到 HTTPS 的 301 跳转，并确认最终 URL 使用 HTTPS。",
    },
  },
  spf: {
    en: {
      title: "Email sender authorization",
      explanation:
        "This checks whether your domain says which services are allowed to send email for your business.",
      businessImpact:
        "Missing SPF can make real email less reliable and makes it easier for others to fake messages from your domain.",
      responsibleOwner: "Email provider or DNS administrator",
      fixDifficulty: "Medium",
      estimatedFixTime: "30 minutes to 2 hours",
      fixSteps: [
        "List the services that send email for the business.",
        "Ask the email provider for the correct SPF record.",
        "Publish or update the TXT record in DNS and avoid duplicate SPF records.",
      ],
      technicianText:
        "Publish one SPF TXT record at the root domain. Include all approved mail senders and avoid multiple v=spf1 records.",
    },
    es: {
      title: "Autorización de envío de correo",
      explanation:
        "Comprueba si el dominio indica qué servicios pueden enviar correo en nombre del negocio.",
      businessImpact:
        "Sin SPF, el correo real puede ser menos confiable y es más fácil falsificar mensajes desde el dominio.",
      responsibleOwner: "Proveedor de correo o administrador DNS",
      fixDifficulty: "Media",
      estimatedFixTime: "30 minutos a 2 horas",
      fixSteps: [
        "Liste los servicios que envían correo para el negocio.",
        "Pida al proveedor de correo el registro SPF correcto.",
        "Publique o actualice el TXT en DNS y evite registros SPF duplicados.",
      ],
      technicianText:
        "Publicar un único registro TXT SPF en el dominio raíz. Incluir todos los remitentes aprobados y evitar múltiples registros v=spf1.",
    },
    zh: {
      title: "邮件发送授权",
      explanation:
        "检查域名是否说明哪些服务可以代表您的企业发送邮件。",
      businessImpact:
        "缺少 SPF 会影响真实邮件的可信度，也更容易被他人冒充您的域名发信。",
      responsibleOwner: "邮件服务商或 DNS 管理员",
      fixDifficulty: "中等",
      estimatedFixTime: "30 分钟到 2 小时",
      fixSteps: [
        "列出企业使用的所有发信服务。",
        "向邮件服务商索取正确的 SPF 记录。",
        "在 DNS 中发布或更新 TXT 记录，并避免多个 SPF 记录。",
      ],
      technicianText:
        "在根域名发布一个 SPF TXT 记录，包含所有授权发信服务，避免出现多个 v=spf1 记录。",
    },
  },
  dmarc: {
    en: {
      title: "Email impersonation policy",
      explanation:
        "This checks whether your domain tells mail systems what to do when a message fails identity checks.",
      businessImpact:
        "Without DMARC, fake emails can be harder to control and customers may receive messages that appear to be from your business.",
      responsibleOwner: "Email provider or DNS administrator",
      fixDifficulty: "Medium",
      estimatedFixTime: "30 minutes to half a day",
      fixSteps: [
        "Create a DMARC record for the domain.",
        "Start with monitoring if you are unsure which services send mail.",
        "Review reports before moving to a stricter policy.",
      ],
      technicianText:
        "Publish a DMARC TXT record at _dmarc.domain. Start with p=none if sender inventory is incomplete, then progress to quarantine or reject after review.",
    },
    es: {
      title: "Política contra suplantación de correo",
      explanation:
        "Comprueba si el dominio indica qué deben hacer los sistemas de correo cuando un mensaje falla controles de identidad.",
      businessImpact:
        "Sin DMARC, es más difícil controlar correos falsos y los clientes pueden recibir mensajes que aparentan venir del negocio.",
      responsibleOwner: "Proveedor de correo o administrador DNS",
      fixDifficulty: "Media",
      estimatedFixTime: "30 minutos a medio día",
      fixSteps: [
        "Cree un registro DMARC para el dominio.",
        "Empiece con monitoreo si no sabe qué servicios envían correo.",
        "Revise los informes antes de aplicar una política más estricta.",
      ],
      technicianText:
        "Publicar un TXT DMARC en _dmarc.dominio. Empezar con p=none si el inventario de remitentes no está completo, luego avanzar a quarantine o reject tras revisar informes.",
    },
    zh: {
      title: "邮件防冒充策略",
      explanation:
        "检查域名是否告诉邮件系统：当邮件身份验证失败时应该如何处理。",
      businessImpact:
        "没有 DMARC 时，假冒邮件更难控制，客户可能收到看似来自您企业的欺诈邮件。",
      responsibleOwner: "邮件服务商或 DNS 管理员",
      fixDifficulty: "中等",
      estimatedFixTime: "30 分钟到半天",
      fixSteps: [
        "为域名创建 DMARC 记录。",
        "如果不确定哪些服务在发信，先使用监控模式。",
        "查看报告后再逐步提高策略强度。",
      ],
      technicianText:
        "在 _dmarc.domain 发布 DMARC TXT 记录。如发信服务清单不完整，先用 p=none，审查报告后逐步调整到 quarantine 或 reject。",
    },
  },
  hsts: {
    en: {
      title: "Browser HTTPS memory",
      explanation:
        "This checks whether browsers are told to remember that your site should use the secure version.",
      businessImpact:
        "Without this, repeat visitors have less protection if a network tries to downgrade their connection.",
      responsibleOwner: "Website host or web developer",
      fixDifficulty: "Medium",
      estimatedFixTime: "30 minutes to 2 hours",
      fixSteps: [
        "Confirm HTTPS works on the whole site.",
        "Add the Strict-Transport-Security response header.",
        "Test carefully before using long durations or preload settings.",
      ],
      technicianText:
        "Add Strict-Transport-Security after confirming HTTPS coverage. Start with a cautious max-age before considering includeSubDomains or preload.",
    },
    es: {
      title: "Memoria HTTPS del navegador",
      explanation:
        "Comprueba si el navegador recibe la indicación de recordar que el sitio debe usar la versión segura.",
      businessImpact:
        "Sin esto, los visitantes recurrentes tienen menos protección si una red intenta degradar la conexión.",
      responsibleOwner: "Hosting web o desarrollador",
      fixDifficulty: "Media",
      estimatedFixTime: "30 minutos a 2 horas",
      fixSteps: [
        "Confirme que HTTPS funciona en todo el sitio.",
        "Agregue la cabecera Strict-Transport-Security.",
        "Pruebe con cuidado antes de usar duraciones largas o preload.",
      ],
      technicianText:
        "Agregar Strict-Transport-Security tras confirmar cobertura HTTPS. Empezar con max-age prudente antes de considerar includeSubDomains o preload.",
    },
    zh: {
      title: "浏览器记住 HTTPS",
      explanation:
        "检查网站是否告诉浏览器以后优先使用安全版本。",
      businessImpact:
        "没有此设置时，回访客户在不可信网络上可能更容易被降级到不安全连接。",
      responsibleOwner: "网站主机商或网站开发人员",
      fixDifficulty: "中等",
      estimatedFixTime: "30 分钟到 2 小时",
      fixSteps: [
        "确认整个网站都能正常使用 HTTPS。",
        "添加 Strict-Transport-Security 响应头。",
        "在使用长时间或 preload 设置前仔细测试。",
      ],
      technicianText:
        "确认 HTTPS 全站覆盖后添加 Strict-Transport-Security。先使用谨慎的 max-age，再考虑 includeSubDomains 或 preload。",
    },
  },
  csp: {
    en: {
      title: "Browser content rules",
      explanation:
        "This checks whether your website gives browsers rules about where scripts, images, and other content may load from.",
      businessImpact:
        "A missing policy can make certain website mistakes more damaging, especially on sites with forms, booking tools, or customer data.",
      responsibleOwner: "Website developer",
      fixDifficulty: "Medium to advanced",
      estimatedFixTime: "2 hours to 1 day",
      fixSteps: [
        "Inventory scripts, forms, analytics, booking tools, and third-party widgets.",
        "Create a Content Security Policy that allows trusted sources.",
        "Test the site so legitimate features are not blocked.",
      ],
      technicianText:
        "Implement a Content-Security-Policy header based on actual asset and script sources. Test in report-only mode if needed before enforcing.",
    },
    es: {
      title: "Reglas de contenido del navegador",
      explanation:
        "Comprueba si el sitio indica al navegador desde dónde pueden cargarse scripts, imágenes y otros contenidos.",
      businessImpact:
        "Sin esta política, ciertos errores del sitio pueden causar más daño, sobre todo en sitios con formularios, reservas o datos de clientes.",
      responsibleOwner: "Desarrollador web",
      fixDifficulty: "Media a avanzada",
      estimatedFixTime: "2 horas a 1 día",
      fixSteps: [
        "Inventarie scripts, formularios, analítica, reservas y widgets externos.",
        "Cree una Content Security Policy que permita fuentes confiables.",
        "Pruebe el sitio para no bloquear funciones legítimas.",
      ],
      technicianText:
        "Implementar cabecera Content-Security-Policy basada en fuentes reales de scripts y recursos. Probar en report-only si hace falta antes de aplicar.",
    },
    zh: {
      title: "浏览器内容规则",
      explanation:
        "检查网站是否告诉浏览器脚本、图片和其他内容可以从哪里加载。",
      businessImpact:
        "缺少此策略时，网站配置错误可能造成更大影响，尤其是带表单、预约工具或客户数据的网站。",
      responsibleOwner: "网站开发人员",
      fixDifficulty: "中等到较高",
      estimatedFixTime: "2 小时到 1 天",
      fixSteps: [
        "盘点脚本、表单、统计工具、预约工具和第三方组件。",
        "创建只允许可信来源的 Content Security Policy。",
        "测试网站，确保正常功能不会被阻止。",
      ],
      technicianText:
        "根据实际脚本和资源来源实施 Content-Security-Policy 响应头。必要时先用 report-only 模式测试，再正式启用。",
    },
  },
  xFrameOptions: {
    en: {
      title: "Protection from hidden page framing",
      explanation:
        "This checks whether your website limits being placed inside another website's frame.",
      businessImpact:
        "Without this protection, attackers may be able to hide your page behind misleading clicks in some scenarios.",
      responsibleOwner: "Website host or web developer",
      fixDifficulty: "Easy",
      estimatedFixTime: "15 minutes to 1 hour",
      fixSteps: [
        "Decide whether the site ever needs to be embedded by trusted partners.",
        "Add X-Frame-Options or the CSP frame-ancestors rule.",
        "Test pages that use booking, payment, or embedded tools.",
      ],
      technicianText:
        "Set X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors as appropriate. Confirm required embeds are not broken.",
    },
    es: {
      title: "Protección contra marcos ocultos",
      explanation:
        "Comprueba si el sitio limita que otra web lo coloque dentro de un marco.",
      businessImpact:
        "Sin esta protección, en algunos escenarios un atacante podría ocultar la página detrás de clics engañosos.",
      responsibleOwner: "Hosting web o desarrollador",
      fixDifficulty: "Fácil",
      estimatedFixTime: "15 minutos a 1 hora",
      fixSteps: [
        "Decida si el sitio necesita ser insertado por socios confiables.",
        "Agregue X-Frame-Options o la regla CSP frame-ancestors.",
        "Pruebe páginas con reservas, pagos o herramientas embebidas.",
      ],
      technicianText:
        "Configurar X-Frame-Options DENY/SAMEORIGIN o CSP frame-ancestors según corresponda. Confirmar que los embeds necesarios no se rompan.",
    },
    zh: {
      title: "防止页面被隐藏嵌入",
      explanation:
        "检查网站是否限制被其他网站放入框架中显示。",
      businessImpact:
        "没有此保护时，在某些情况下攻击者可能把您的页面隐藏在误导性点击背后。",
      responsibleOwner: "网站主机商或网站开发人员",
      fixDifficulty: "简单",
      estimatedFixTime: "15 分钟到 1 小时",
      fixSteps: [
        "确认网站是否需要被可信合作方嵌入。",
        "添加 X-Frame-Options 或 CSP frame-ancestors 规则。",
        "测试预约、支付或嵌入工具相关页面。",
      ],
      technicianText:
        "根据需求设置 X-Frame-Options DENY/SAMEORIGIN 或 CSP frame-ancestors，并确认必要的嵌入功能未受影响。",
    },
  },
};

export function getReportRule(checkKey: string, language: ReportLanguage) {
  return (
    reportRules[checkKey]?.[language] || {
      title: checkKey,
      explanation: "This item is part of the public website exposure review.",
      businessImpact:
        "Ask the website technician to review whether this signal affects trust, email, or browser protection.",
      responsibleOwner: "Website technician",
      fixDifficulty: "Review needed",
      estimatedFixTime: "Depends on setup",
      fixSteps: ["Review the scanner status and related website configuration."],
      technicianText:
        "Review this scan item and confirm whether DNS, TLS, headers, or hosting configuration needs adjustment.",
    }
  );
}
