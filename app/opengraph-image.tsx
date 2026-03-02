import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "元象能量会员系统";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0A231C 0%, #123524 55%, #173B2B 100%)",
          color: "#F6F1E8",
          fontFamily: "serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(230,200,143,0.28), transparent 28%), radial-gradient(circle at bottom left, rgba(200,165,92,0.16), transparent 32%)"
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "74px 82px",
            position: "relative"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 22,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#E6C88F"
              }}
            >
              元象能量会员系统
            </div>
            <div
              style={{
                width: 110,
                height: 2,
                background: "linear-gradient(135deg, #C8A55C, #E6C88F)"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 850 }}>
            <div
              style={{
                fontSize: 78,
                lineHeight: 1.08,
                fontWeight: 700
              }}
            >
              在秩序之中，
              <br />
              看见时间为你留下的痕迹。
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.55,
                color: "rgba(246, 241, 232, 0.84)",
                maxWidth: 760
              }}
            >
              为长期体验而设计的成长空间，整合会员、课程活动、导师会谈与稳定回馈结构。
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "rgba(246, 241, 232, 0.74)"
            }}
          >
            <div style={{ display: "flex", gap: 18 }}>
              <span>Membership</span>
              <span>Guidance</span>
              <span>Programs</span>
            </div>
            <div style={{ color: "#E6C88F" }}>yxenergy.my</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
