import { Navbar } from "@/components/Navbar";

export function Support() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Support</h1>
          <div className="bg-card p-8 rounded-lg shadow-lg border border-primary/20">
            <p className="text-lg mb-6 text-center">
              If you need help or have any questions, please do not hesitate to reach out!
            </p>
            <div className="space-y-4 text-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Discord</h2>
                <p>
                  Join our Discord channel for community support and discussions:
                  <br />
                  <a
                    href="https://discord.com/channels/1374554309596938271/1374554311215808544"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Stellar Videos Discord
                  </a>
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Email</h2>
                <p>
                  You can also email us directly at:
                  <br />
                  <a
                    href="mailto:michael@stellarscreens.shop"
                    className="text-primary hover:underline"
                  >
                    michael@stellarscreens.shop
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Support;
