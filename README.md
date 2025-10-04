# Pre-Market Checklist & Safe Rollout Automation

A comprehensive platform for managing pre-market validations, configuration management, connectivity monitoring, canary deployments, and feature flags in financial trading systems.

## 🚀 Features

### 1. Configuration Validation
- **Real-time Validation**: Validate trading strategy configurations with instant feedback
- **Risk Limit Checks**: Ensure all risk parameters are within acceptable bounds
- **Venue Configuration**: Validate connectivity settings for trading venues
- **Diff Comparison**: Compare configuration versions to identify changes
- **Version Management**: Track configuration versions with semantic versioning

### 2. Pre-Market Checklist
- **Automated Checks**: Run comprehensive pre-market validation suites
- **Multiple Categories**:
  - Configuration validation
  - Connectivity checks
  - Market data feed health
  - Risk limit verification
  - System resource monitoring
- **Detailed Reporting**: Get granular status for each check with timing information
- **Environment Support**: Run checks for production and staging environments

### 3. Connectivity Monitoring
- **Endpoint Health**: Monitor connectivity to trading venues (NYSE, NASDAQ, BATS)
- **SLA Tracking**: Track uptime, response times, and error rates
- **Feed Status**: Monitor real-time market data feeds
- **Historical Data**: View connectivity trends over time
- **Alert System**: Get notified of connectivity issues

### 4. Canary Deployments
- **Progressive Rollouts**: Deploy new versions gradually with traffic splitting
- **Health Monitoring**: Automatic health checks at each stage
- **Auto-Rollback**: Automatically roll back on failure detection
- **Stage Configuration**: Define custom deployment stages with traffic percentages
- **Metrics Tracking**: Monitor error rates, latency, and throughput

### 5. Feature Flags
- **Dynamic Control**: Enable/disable features without redeployment
- **Environment-Specific**: Configure flags per environment
- **CI Integration**: Control CI pipeline behavior with flags
- **Gradual Rollouts**: Enable features for percentage of users
- **A/B Testing**: Support for experimentation and testing

### 6. Dashboard
- **System Health Overview**: At-a-glance view of all system components
- **Real-time Metrics**: Monitor key performance indicators
- **Activity Feed**: Track all system events and changes
- **Quick Actions**: Access common operations from the dashboard

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/johaankjis/Pre-Market-Checklist---Safe-Rollout-Automation.git
cd Pre-Market-Checklist---Safe-Rollout-Automation
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
# or
pnpm install
```

3. **Run the development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── canary/              # Canary deployment endpoints
│   │   ├── checklist/           # Checklist execution endpoints
│   │   ├── ci/                  # CI pipeline endpoints
│   │   ├── connectivity/        # Connectivity check endpoints
│   │   ├── feature-flags/       # Feature flag endpoints
│   │   └── validate/            # Configuration validation endpoints
│   ├── canary/                  # Canary deployment UI
│   ├── checklist/               # Pre-market checklist UI
│   ├── connectivity/            # Connectivity monitoring UI
│   ├── dashboard/               # Main dashboard UI
│   ├── feature-flags/           # Feature flags UI
│   └── page.tsx                 # Config validation home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── *.tsx                    # Feature-specific components
├── lib/                         # Core business logic
│   ├── canary/                  # Canary deployment engine
│   ├── checklist/               # Checklist execution engine
│   ├── ci/                      # CI management
│   ├── connectivity/            # Health checking logic
│   ├── feature-flags/           # Feature flag manager
│   ├── mock-data/               # Mock data generators
│   ├── types/                   # TypeScript type definitions
│   └── validation/              # Configuration validation logic
├── public/                      # Static assets
├── styles/                      # Global styles
└── docs/                        # Additional documentation (see docs/)
```

## 🎯 Quick Start Guide

### Running a Pre-Market Checklist

1. Navigate to the **Checklist** page from the dashboard
2. Select your environment (Production or Staging)
3. Click **Run Checklist**
4. Monitor the progress of each check in real-time
5. Review the summary and detailed results

### Validating Configuration

1. Go to the **Config Validation** home page
2. Select an environment and strategy
3. Click **Validate** to run validation
4. Review errors, warnings, and suggestions
5. Use the **Compare** tab to see configuration diffs

### Starting a Canary Deployment

1. Navigate to the **Canary Deployments** page
2. Click **New Deployment**
3. Configure deployment stages and health thresholds
4. Start the deployment and monitor progress
5. System will auto-rollback if health checks fail

### Managing Feature Flags

1. Go to the **Feature Flags** page
2. Toggle features on/off for different environments
3. Configure rollout percentages for gradual releases
4. Enable/disable CI pipeline features

## 🔌 API Reference

For detailed API documentation, see [API.md](./docs/API.md)

### Key Endpoints

- `POST /api/checklist` - Execute pre-market checklist
- `GET /api/checklist` - Get current checklist status
- `POST /api/validate` - Validate configuration
- `GET /api/connectivity` - Get connectivity status
- `POST /api/connectivity` - Run connectivity checks
- `POST /api/canary` - Start canary deployment
- `GET /api/canary/:id` - Get deployment status
- `GET /api/feature-flags` - Get feature flags
- `PUT /api/feature-flags/:id` - Update feature flag

## 🏗️ Architecture

This application is built with:

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **Data Visualization**: Recharts

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📊 Key Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icon set
- **Recharts**: Composable charting library
- **date-fns**: Modern date utility library

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📝 License

This project is private and proprietary.

## 📚 Additional Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Component Library](./docs/COMPONENTS.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## 🔒 Security

For security concerns, please contact the maintainers directly rather than opening public issues.

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.

---

Built with ❤️ for safe and reliable trading operations.
